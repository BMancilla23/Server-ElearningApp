import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './schemas/course.schema';
import { Section } from 'src/sections/schemas/section.schema';
import { Lesson } from 'src/lessons/schemas/lesson.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel('Course') private readonly courseRepository: Model<Course>,
    @InjectModel('Section') private readonly sectionRepository: Model<Section>,
    @InjectModel('Lesson') private readonly lessonRepository: Model<Lesson>,
    @InjectConnection() private readonly connection: Connection,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    // Iniciar sesion de la base de datos y comenzar transaccion
    const session = await this.connection.startSession();

    session.startTransaction();

    try {
      // Crear curso
      const {
        title,
        description,
        level,
        price,
        category,
        prerequisites,
        sections,
      } = createCourseDto;

      const course = await this.courseRepository.create(
        [
          {
            title,
            description,
            level,
            price,
            category,
            prerequisites,
          },
        ],
        { session },
      );

      const courseId = course[0]._id;

      // Craer secciones y lecciones en lotes
      const sectionsData = sections.map((sectionDto) => ({
        ...sectionDto,
        course: courseId,
      }));

      const createdSections = await this.sectionRepository.insertMany(
        sectionsData,
        {
          session,
        },
      );

      // Crear las lecciones
      const lessonsData = [];

      createdSections.forEach((section, index) => {
        const sectionLessons = sections[index].lessons.map((lesson) => ({
          ...lesson,
          section: section._id,
        }));
        lessonsData.push(...sectionLessons);
      });

      const createdLessons = await this.lessonRepository.insertMany(
        lessonsData,
        {
          session,
        },
      );

      const sectionIds = createdSections.map((section) => section._id);

      await this.courseRepository.updateOne(
        { _id: courseId },
        { $set: { sections: sectionIds } },
        { session },
      );

      const populateCourse = await this.courseRepository
        .findById({
          _id: courseId,
        })
        .populate({
          path: 'sections',
          populate: {
            path: 'lessons',
          },
        });

      await session.commitTransaction();

      return {
        message: 'Course created successfully',
        course: populateCourse,
        sections: createdSections,
        lessons: createdLessons,
      };
    } catch (error) {
      await session.abortTransaction();
      /*  session.endSession(); */
      throw new InternalServerErrorException(
        'Error creating course',
        error.message,
      );
    } finally {
      session.endSession();
    }
  }

  async uploadCourse(file: Express.Multer.File) {
    try {
      if (!file || !file.buffer) {
        throw new BadRequestException('Invalid file or file buffer is missing');
      }

      const proccededBuffer = await this.cloudinaryService.resizeAndOptimize(
        file.buffer,
        800,
        440,
        'webp',
        'cover',
      );

      const uploadResult = await this.cloudinaryService.uploadStream(
        proccededBuffer,
        {
          folder: 'courses',
        },
      );

      console.log(uploadResult);

      if (!uploadResult || !uploadResult.secure_url) {
        throw new InternalServerErrorException(
          'Failed to upload course to Cloudinary',
        );
      }

      return {
        message: 'Course uploaded successfully',
        course: uploadResult.secure_url,
      };
    } catch (error) {
      console.error('Error al subir el curso:', error.message);
      throw new InternalServerErrorException('Error uploading course');
    }
  }

  findAll() {
    return `This action returns all courses`;
  }

  findOne(id: number) {
    return `This action returns a #${id} course`;
  }

  update(id: number, updateCourseDto: UpdateCourseDto) {
    return `This action updates a #${id} course`;
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }
}
