import { ApiProperty } from '@nestjs/swagger';
import { ProviderEntity, PaginationMeta } from '../../../app/providers/entities/provider.entity';

export class AdminProviderResponseDto {
  @ApiProperty({ type: ProviderEntity })
  data: ProviderEntity;
}

export class AdminProviderListResponseDto {
  @ApiProperty({ type: [ProviderEntity] })
  items: ProviderEntity[];

  @ApiProperty({ type: PaginationMeta })
  pagination: PaginationMeta;
}
