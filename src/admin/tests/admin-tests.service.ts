import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { ApiResponseHelper } from '../../common/utils/response.util';

@Injectable()
export class AdminTestsService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  async create(dto: CreateTestDto) {
    const slug = this.generateSlug(dto.name);
    
    const exists = await this.prisma.test.findUnique({ where: { slug } });
    if (exists) {
      throw new ConflictException('Test with this name already exists');
    }

    const test = await this.prisma.test.create({
      data: {
        ...dto,
        slug,
      },
    });
    return ApiResponseHelper.success('Test created successfully', test);
  }

  async findAll() {
    const tests = await this.prisma.test.findMany({
      orderBy: { name: 'asc' },
    });
    return ApiResponseHelper.success('Tests fetched successfully', tests);
  }

  async findOne(id: string) {
    const test = await this.prisma.test.findUnique({
      where: { id },
    });
    if (!test) throw new NotFoundException('Test not found');
    return ApiResponseHelper.success('Test fetched successfully', test);
  }

  async update(id: string, dto: UpdateTestDto) {
    let slug = undefined;
    if (dto.name) {
      slug = this.generateSlug(dto.name);
      const exists = await this.prisma.test.findFirst({
        where: { slug, id: { not: id } },
      });
      if (exists) {
        throw new ConflictException('Test with this name already exists');
      }
    }

    const test = await this.prisma.test.update({
      where: { id },
      data: {
        ...dto,
        ...(slug && { slug }),
      },
    }).catch(() => {
      throw new NotFoundException('Test not found');
    });

    return ApiResponseHelper.success('Test updated successfully', test);
  }

  async remove(id: string) {
    await this.prisma.test.delete({
      where: { id },
    }).catch(() => {
      throw new NotFoundException('Test not found');
    });
    return ApiResponseHelper.success('Test deleted successfully');
  }
}
