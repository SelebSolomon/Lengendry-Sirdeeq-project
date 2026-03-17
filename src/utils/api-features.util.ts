import { ParsedQs } from "qs";

type QueryString = ParsedQs;

const EXCLUDED = ["page", "sort", "limit", "fields", "search"] as const;

const SORT_FIELD_MAP: Record<string, string> = {
  // add aliases if needed e.g. createdAt: "date"
};

export class APIFeatures {
  private where: Record<string, any> = {};
  private orderBy: Record<string, "asc" | "desc"> | undefined;
  private select: Record<string, boolean> | undefined;
  private skip: number = 0;
  private take: number = 10;

  constructor(private queryString: QueryString) {}

  filter(): this {
    const filteredQuery = { ...this.queryString };
    EXCLUDED.forEach((key) => delete filteredQuery[key]);

    for (const fieldName in filteredQuery) {
      const fieldValue = filteredQuery[fieldName];

      if (typeof fieldValue === "object" && !Array.isArray(fieldValue)) {
        // e.g. ?price[gte]=10&price[lte]=100
        const operators = fieldValue as Record<string, string>;
        this.where[fieldName] = {};
        for (const operator in operators) {
          const rawValue = operators[operator];
          const numericValue = Number(rawValue);
          // Prisma operators: gte, lte, gt, lt, equals
          this.where[fieldName][operator] = isNaN(numericValue) ? rawValue : numericValue;
        }
      } else {
        this.where[fieldName] = fieldValue;
      }
    }

    // Full-text search — uses Prisma's `contains` on name + description
    if (this.queryString.search) {
      this.where.OR = [
        { name: { contains: this.queryString.search as string, mode: "insensitive" } },
        { description: { contains: this.queryString.search as string, mode: "insensitive" } },
      ];
    }

    return this;
  }

  sort(): this {
    if (this.queryString.sort) {
      const sortParam = this.queryString.sort as string;
      const fieldName = sortParam.replace("-", "");
      const direction = sortParam.startsWith("-") ? "desc" : "asc";
      const mappedField = SORT_FIELD_MAP[fieldName] ?? fieldName;
      this.orderBy = { [mappedField]: direction };
    } else {
      this.orderBy = { date: "desc" };
    }
    return this;
  }

  fieldsLimit(): this {
    if (this.queryString.fields) {
      const requestedFields = (this.queryString.fields as string).split(",");
      this.select = Object.fromEntries(requestedFields.map((field) => [field.trim(), true]));
    }
    return this;
  }

  paginate(): this {
    const currentPage = Math.max(1, parseInt(this.queryString.page as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(this.queryString.limit as string) || 10));
    this.skip = (currentPage - 1) * pageSize;
    this.take = pageSize;
    return this;
  }

  // Returns args ready to spread into prisma.model.findMany()
  build() {
    return {
      where: this.where,
      orderBy: this.orderBy,
      select: this.select,
      skip: this.skip,
      take: this.take,
    };
  }
}
