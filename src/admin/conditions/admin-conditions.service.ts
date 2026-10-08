import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConditionDto } from './dto/create-condition.dto';
import { UpdateConditionDto } from './dto/update-condition.dto';
import { ApiResponseHelper } from '../../common/utils/response.util';

@Injectable()
export class AdminConditionsService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  async create(dto: CreateConditionDto) {
    const slug = this.generateSlug(dto.name);
    
    const exists = await this.prisma.condition.findUnique({ where: { slug } });
    if (exists) {
      throw new ConflictException('Condition with this name already exists');
    }

    const condition = await this.prisma.condition.create({
      data: {
        ...dto,
        slug,
      },
    });
    return ApiResponseHelper.success('Condition created successfully', condition);
  }

  async findAll() {
    const conditions = await this.prisma.condition.findMany({
      orderBy: { name: 'asc' },
    });
    return ApiResponseHelper.success('Conditions fetched successfully', conditions);
  }

  async findOne(id: string) {
    const condition = await this.prisma.condition.findUnique({
      where: { id },
    });
    if (!condition) throw new NotFoundException('Condition not found');
    return ApiResponseHelper.success('Condition fetched successfully', condition);
  }

  async update(id: string, dto: UpdateConditionDto) {
    let slug: string | undefined = undefined;
    if (dto.name) {
      slug = this.generateSlug(dto.name);
      const exists = await this.prisma.condition.findFirst({
        where: { slug, id: { not: id } },
      });
      if (exists) {
        throw new ConflictException('Condition with this name already exists');
      }
    }

    const condition = await this.prisma.condition.update({
      where: { id },
      data: {
        ...dto,
        ...(slug && { slug }),
      },
    }).catch(() => {
      throw new NotFoundException('Condition not found');
    });

    return ApiResponseHelper.success('Condition updated successfully', condition);
  }

  async remove(id: string) {
    await this.prisma.condition.delete({
      where: { id },
    }).catch(() => {
      throw new NotFoundException('Condition not found');
    });
    return ApiResponseHelper.success('Condition deleted successfully');
  }
}
