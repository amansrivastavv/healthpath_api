const { plainToInstance, Transform } = require('class-transformer');
const { validateSync, IsOptional, IsUUID } = require('class-validator');

class MyDto {
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? undefined : trimmed;
    }
    return value;
  })
  @IsOptional()
  @IsUUID('4')
  providerId;
}

const obj1 = plainToInstance(MyDto, { providerId: "" });
console.log("obj1:", obj1);
const err1 = validateSync(obj1);
console.log("errors:", err1.map(e => e.property + " " + JSON.stringify(e.constraints)));
