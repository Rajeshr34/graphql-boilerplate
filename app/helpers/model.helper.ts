export class ModelHelper {
    static getPagination(page: any): { offset: any, limit: any } {
        page--;
        if (page < 0)
            page = 0;
        const offset = page * parseInt(process.env.PAGE_SIZE);
        const limit = parseInt(process.env.PAGE_SIZE);
        return {
            offset,
            limit,
        };
    }

    static includeNested(object: any, include: boolean = true) {
        if (include) {
            object.include = [
                {
                    // @ts-ignore
                    nested: true,
                    all: true,
                }
            ];
        }
        return object;
    }
}
