/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  IQueryConfig,
  IQueryParams,
  IQueryResult,
  PrismaCountArgs,
  PrismaFindManyArgs,
  PrismaModelDelegate,
  PrismaNumberFilter,
  PrismaStringFilter,
  PrismaWhereConditions,
} from "../interfaces/query.interface";

export class QueryBuilder<
  T,
  TWhereInput = Record<string, unknown>,
  TInclude = Record<string, unknown>
> {
  private query: PrismaFindManyArgs;
  private countQuery: PrismaCountArgs;

  private page = 1;
  private limit = 10;
  private skip = 0;

  private sortBy = "createdAt";
  private sortOrder: "asc" | "desc" = "desc";

  private selectFields: Record<string, boolean> | undefined;

  constructor(
    private model: PrismaModelDelegate,
    private queryParams: IQueryParams,
    private config: IQueryConfig = {}
  ) {
    this.query = {
      where: {},
      include: {},
      orderBy: {},
      skip: 0,
      take: 10,
    };

    this.countQuery = {
      where: {},
    };
  }

  /* ================= SEARCH ================= */

  search(): this {
    const { searchTerm } = this.queryParams;
    const { searchableFields } = this.config;

    if (searchTerm && searchableFields?.length) {
      const searchConditions: Record<string, unknown>[] =
        searchableFields.map((field) => {
          const stringFilter: PrismaStringFilter = {
            contains: searchTerm,
            mode: "insensitive",
          };

          if (field.includes(".")) {
            const parts = field.split(".");

            if (parts.length === 2) {
              const [relation, nestedField] = parts;
              return {
                [relation]: {
                  [nestedField]: stringFilter,
                },
              };
            }

            if (parts.length === 3) {
              const [relation, nestedRelation, nestedField] = parts;
              return {
                [relation]: {
                  some: {
                    [nestedRelation]: {
                      [nestedField]: stringFilter,
                    },
                  },
                },
              };
            }
          }

          return { [field]: stringFilter };
        });

      (this.query.where as PrismaWhereConditions).OR = searchConditions;
      (this.countQuery.where as PrismaWhereConditions).OR =
        searchConditions;
    }

    return this;
  }

  /* ================= FILTER ================= */

  filter(): this {
    const { filterableFields } = this.config;

    const excludedFields = [
      "searchTerm",
      "page",
      "limit",
      "sortBy",
      "sortOrder",
      "fields",
      "include",
    ];

    const filterParams: Record<string, unknown> = {};

    Object.keys(this.queryParams).forEach((key) => {
      if (!excludedFields.includes(key)) {
        filterParams[key] = this.queryParams[key];
      }
    });

    const queryWhere = this.query.where as Record<string, unknown>;
    const countQueryWhere = this.countQuery.where as Record<
      string,
      unknown
    >;

    Object.keys(filterParams).forEach((key) => {
      const value = filterParams[key];

      if (value === undefined || value === "") return;

      const isAllowed =
        !filterableFields ||
        filterableFields.length === 0 ||
        filterableFields.includes(key);

      if (!isAllowed) return;

      /* ---------- Nested filter ---------- */

      if (key.includes(".")) {
        const parts = key.split(".");

        if (parts.length === 2) {
          const [relation, nestedField] = parts;

          if (!queryWhere[relation]) {
            queryWhere[relation] = {};
            countQueryWhere[relation] = {};
          }

          // Apply case-insensitive filtering for string values
          const filterValue =
            typeof value === "string"
              ? { contains: value, mode: "insensitive" as const }
              : this.parseFilterValue(value);

          (queryWhere[relation] as Record<string, unknown>)[nestedField] =
            filterValue;

          (countQueryWhere[relation] as Record<string, unknown>)[
            nestedField 
          ] = filterValue;

          return;
        }

        if (parts.length === 3) {
          const [relation, nestedRelation, nestedField] = parts;

          if (!queryWhere[relation]) {
            queryWhere[relation] = { some: {} };
            countQueryWhere[relation] = { some: {} };
          }

          const queryRel = queryWhere[relation] as Record<string, any>;
          const countRel = countQueryWhere[relation] as Record<
            string,
            any
          >;

          if (!queryRel.some) queryRel.some = {};
          if (!countRel.some) countRel.some = {};

          if (!queryRel.some[nestedRelation])
            queryRel.some[nestedRelation] = {};
          if (!countRel.some[nestedRelation])
            countRel.some[nestedRelation] = {};

          queryRel.some[nestedRelation][nestedField] =
            this.parseFilterValue(value);

          countRel.some[nestedRelation][nestedField] =
            this.parseFilterValue(value);

          return;
        }
      }

      /* ---------- Range filter ---------- */

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        queryWhere[key] = this.parseRangeFilter(
          value as Record<string, string | number>
        );
        countQueryWhere[key] = this.parseRangeFilter(
          value as Record<string, string | number>
        );
        return;
      }

      /* ---------- Direct filter ---------- */

      queryWhere[key] = this.parseFilterValue(value);
      countQueryWhere[key] = this.parseFilterValue(value);
    });

    return this;
  }

  /* ================= PAGINATION ================= */

  paginate(): this {
    this.page = Number(this.queryParams.page) || 1;
    this.limit = Number(this.queryParams.limit) || 10;
    this.skip = (this.page - 1) * this.limit;

    this.query.skip = this.skip;
    this.query.take = this.limit;

    return this;
  }

  /* ================= SORT ================= */

sort(): this {
  const sortByParam = this.queryParams.sortBy || "createdAt";
  const sortOrderParam = this.queryParams.sortOrder || "desc";

  const sortFields = sortByParam.split(",").map((f) => f.trim());
  const sortOrders = sortOrderParam.split(",").map((o) => o.trim());

  const orderBy: Record<string, unknown>[] = [];

  sortFields.forEach((field, index) => {
    const order =
      sortOrders[index] === "asc" || sortOrders[index] === "desc"
        ? sortOrders[index]
        : (sortOrders[0] === "asc" || sortOrders[0] === "desc" ? sortOrders[0] : "desc"); // Use first sort order as fallback, or desc

    // 🔹 Nested support (same as your existing logic)
    if (field.includes(".")) {
      const parts = field.split(".");

      if (parts.length === 2) {
        const [relation, nestedField] = parts;
        orderBy.push({
          [relation]: { [nestedField]: order },
        });
      } else if (parts.length === 3) {
        const [relation, nestedRelation, nestedField] = parts;
        orderBy.push({
          [relation]: {
            [nestedRelation]: { [nestedField]: order },
          },
        });
      }
    } else {
      orderBy.push({ [field]: order });
    }
  });

  this.query.orderBy = orderBy;

  return this;
}
  /* ================= FIELDS ================= */

  fields(): this {
    const fieldsParam = this.queryParams.fields;

    if (fieldsParam && typeof fieldsParam === "string") {
      const fieldsArray = fieldsParam
        .split(",")
        .map((f) => f.trim());

      this.selectFields = {};

      fieldsArray.forEach((field) => {
        this.selectFields![field] = true;
      });

      this.query.select = this.selectFields;
      delete this.query.include;
    }

    return this;
  }

  /* ================= INCLUDE ================= */

  include(relation: TInclude): this {
    if (this.selectFields) return this;

    this.query.include = {
      ...(this.query.include as Record<string, unknown>),
      ...(relation as Record<string, unknown>),
    };

    return this;
  }

  /* ================= DYNAMIC INCLUDE ================= */

  dynamicInclude(
    includeConfig: Record<string, unknown>,
    defaultInclude?: string[]
  ): this {
    if (this.selectFields) return this;

    const result: Record<string, unknown> = {};

    defaultInclude?.forEach((field) => {
      if (includeConfig[field]) {
        result[field] = includeConfig[field];
      }
    });

    const includeParam = this.queryParams.include;

    if (includeParam) {
      includeParam.split(",").forEach((rel) => {
        const relation = rel.trim();
        if (includeConfig[relation]) {
          result[relation] = includeConfig[relation];
        }
      });
    }

    this.query.include = {
      ...(this.query.include as Record<string, unknown>),
      ...result,
    };

    return this;
  }

  /* ================= WHERE ================= */

  where(condition: TWhereInput): this {
    this.query.where = this.deepMerge(
      this.query.where as Record<string, unknown>,
      condition as Record<string, unknown>
    );

    this.countQuery.where = this.deepMerge(
      this.countQuery.where as Record<string, unknown>,
      condition as Record<string, unknown>
    );

    return this;
  }

  /* ================= EXECUTE ================= */

  async execute(): Promise<IQueryResult<T>> {
    const [total, data] = await Promise.all([
      this.model.count(
        this.countQuery as Parameters<typeof this.model.count>[0]
      ),
      this.model.findMany(
        this.query as Parameters<typeof this.model.findMany>[0]
      ),
    ]);

    return {
      data: data as T[],
      meta: {
        page: this.page,
        limit: this.limit,
        total,
        totalPages: Math.ceil(total / this.limit),
      },
    };
  }

  async count(): Promise<number> {
    return this.model.count(
      this.countQuery as Parameters<typeof this.model.count>[0]
    );
  }

  getQuery(): PrismaFindManyArgs {
    return this.query;
  }

  /* ================= HELPERS ================= */

  private deepMerge(
    target: Record<string, unknown>,
    source: Record<string, unknown>
  ): Record<string, unknown> {
    const result = { ...target };

    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        if (
          result[key] &&
          typeof result[key] === "object" &&
          !Array.isArray(result[key])
        ) {
          result[key] = this.deepMerge(
            result[key] as Record<string, unknown>,
            source[key] as Record<string, unknown>
          );
        } else {
          result[key] = source[key];
        }
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  private parseFilterValue(value: unknown): unknown {
    if (value === "true") return true;
    if (value === "false") return false;

    if (
      typeof value === "string" &&
      !isNaN(Number(value)) &&
      value !== ""
    ) {
      return Number(value);
    }

    if (Array.isArray(value)) {
      return {
        in: value.map((v) => this.parseFilterValue(v)),
      };
    }

    return value;
  }

  private parseRangeFilter(
    value: Record<string, string | number>
  ):
    | PrismaNumberFilter
    | PrismaStringFilter
    | Record<string, unknown> {
    const rangeQuery: Record<string, unknown> = {};

    Object.keys(value).forEach((operator) => {
      const val = value[operator];

      const parsed =
        typeof val === "string" && !isNaN(Number(val))
          ? Number(val)
          : val;

      switch (operator) {
        case "lt":
        case "lte":
        case "gt":
        case "gte":
        case "equals":
        case "not":
        case "contains":
        case "startsWith":
        case "endsWith":
          rangeQuery[operator] = parsed;
          break;

        case "in":
        case "notIn":
          rangeQuery[operator] = Array.isArray(val)
            ? val
            : [parsed];
          break;
      }
    });

    return Object.keys(rangeQuery).length ? rangeQuery : value;
  }
}