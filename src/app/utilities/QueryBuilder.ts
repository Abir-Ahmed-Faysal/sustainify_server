import { IQueryConfig, IQueryParams, IQueryResult, PrismaCountArgs, PrismaFindManyArgs, PrismaModelDelegate, PrismaNumberFilter, PrismaStringFilter, PrismaWhereConditions } from "../interfaces/query.interface";

// T = Model Type
/* eslint-disable @typescript-eslint/no-explicit-any */

export class QueryBuilder<
    T,
    TWhereInput = Record<string, unknown>,
    TInclude = Record<string, unknown>
> {
    private query: PrismaFindManyArgs;
    private countQuery: PrismaCountArgs;
    private page: number = 1;
    private limit: number = 10;
    private skip: number = 0;
    private sortBy: string = "createdAt";
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

        if (searchTerm && searchableFields && searchableFields.length > 0) {
            const searchConditions = searchableFields.map((field) => {
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
            (this.countQuery.where as PrismaWhereConditions).OR = searchConditions;
        }

        return this;
    }

    /* ================= FILTER ================= */

    filter(): this {
        const { filterableFields } = this.config;

        const excludedField = [
            "searchTerm",
            "page",
            "limit",
            "sortBy",
            "sortOrder",
            "fields",
            "include",
            "includes",
        ];

        const filterParams: Record<string, unknown> = {};

        Object.keys(this.queryParams).forEach((key) => {
            if (!excludedField.includes(key)) {
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

            const isAllowedField =
                !filterableFields ||
                filterableFields.length === 0 ||
                filterableFields.includes(key);

            if (!isAllowedField) return;

            if (key.includes(".")) {
                const parts = key.split(".");

                if (parts.length === 2) {
                    const [relation, nestedField] = parts;

                    queryWhere[relation] = {
                        ...(queryWhere[relation] as object),
                        [nestedField]: this.parseFilterValue(value),
                    };

                    countQueryWhere[relation] = {
                        ...(countQueryWhere[relation] as object),
                        [nestedField]: this.parseFilterValue(value),
                    };

                    return;
                }

                if (parts.length === 3) {
                    const [relation, nestedRelation, nestedField] = parts;

                    queryWhere[relation] = {
                        some: {
                            ...(queryWhere[relation] as any)?.some,
                            [nestedRelation]: {
                                ...(queryWhere[relation] as any)?.some?.[nestedRelation],
                                [nestedField]: this.parseFilterValue(value),
                            },
                        },
                    };

                    countQueryWhere[relation] = {
                        some: {
                            ...(countQueryWhere[relation] as any)?.some,
                            [nestedRelation]: {
                                ...(countQueryWhere[relation] as any)?.some?.[
                                nestedRelation
                                ],
                                [nestedField]: this.parseFilterValue(value),
                            },
                        },
                    };

                    return;
                }
            }

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

            queryWhere[key] = this.parseFilterValue(value);
            countQueryWhere[key] = this.parseFilterValue(value);
        });

        return this;
    }

    /* ================= PAGINATION ================= */

    paginate(): this {
        const page = Number(this.queryParams.page) || 1;
        const limit = Number(this.queryParams.limit) || 10;

        this.page = page;
        this.limit = limit;
        this.skip = (page - 1) * limit;

        this.query.skip = this.skip;
        this.query.take = this.limit;

        return this;
    }

    /* ================= SORT ================= */

    sort(): this {
        const sortBy = this.queryParams.sortBy || "createdAt";
        const sortOrder =
            this.queryParams.sortOrder === "asc" ? "asc" : "desc";

        this.sortBy = sortBy;
        this.sortOrder = sortOrder;

        if (sortBy.includes(".")) {
            const parts = sortBy.split(".");

            if (parts.length === 2) {
                const [relation, nestedField] = parts;
                this.query.orderBy = {
                    [relation]: { [nestedField]: sortOrder },
                };
            } else if (parts.length === 3) {
                const [relation, nestedRelation, nestedField] = parts;
                this.query.orderBy = {
                    [relation]: {
                        [nestedRelation]: { [nestedField]: sortOrder },
                    },
                };
            }
        } else {
            this.query.orderBy = { [sortBy]: sortOrder };
        }

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

        // if select() is used, ignore include to prevent conflict
        if (this.selectFields) {
            return this;
        }

        const result: Record<string, unknown> = {};

        // ✅ apply default includes first
        defaultInclude?.forEach((field) => {
            if (includeConfig[field]) {
                result[field] = includeConfig[field];
            }
        });

        // ✅ apply requested includes from query param
        const includeParam = this.queryParams.include as string | undefined;

        if (includeParam && typeof includeParam === "string") {
            const requestedRelations = includeParam
                .split(",")
                .map((relation) => relation.trim());

            requestedRelations.forEach((relation) => {
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
            this.model.count(this.countQuery),
            this.model.findMany(this.query),
        ]);

        const totalPages = Math.ceil(total / this.limit);

        return {
            data: data as T[],
            meta: {
                page: this.page,
                limit: this.limit,
                total,
                totalPages,
            },
        };
    }

    /* ================= FIXED deepMerge ================= */

    private deepMerge(
        target: Record<string, unknown>,
        source: Record<string, unknown>
    ): Record<string, unknown> {
        const result = { ...target };

        for (const key in source) {
            if (Array.isArray(source[key]) && Array.isArray(result[key])) {
                result[key] = [
                    ...(result[key] as unknown[]),
                    ...(source[key] as unknown[]),
                ];
                continue;
            }

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

    /* ================= HELPERS ================= */

    private parseFilterValue(value: unknown): unknown {
        if (value === "true") return true;
        if (value === "false") return false;

        if (typeof value === "string" && !isNaN(Number(value)) && value !== "") {
            return Number(value);
        }

        if (Array.isArray(value)) {
            return { in: value.map((v) => this.parseFilterValue(v)) };
        }

        return value;
    }

    private parseRangeFilter(
        value: Record<string, string | number>
    ): PrismaNumberFilter | PrismaStringFilter | Record<string, unknown> {
        const rangeQuery: Record<string, unknown> = {};

        Object.keys(value).forEach((operator) => {
            const operatorValue = value[operator];

            const parsedValue =
                typeof operatorValue === "string" &&
                    !isNaN(Number(operatorValue))
                    ? Number(operatorValue)
                    : operatorValue;

            rangeQuery[operator] = parsedValue;
        });

        return Object.keys(rangeQuery).length > 0
            ? rangeQuery
            : value;
    }
}