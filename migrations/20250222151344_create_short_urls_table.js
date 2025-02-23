/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
    return knex.schema.createTable("short_urls", (table) => {
        table.increments("id").primary();
        table
            .uuid("public_id", { useBinaryUuid: true })
            .defaultTo(knex.raw("(UUID_TO_BIN(UUID(), 1))"))
            .index()
            .notNullable();
        table.string("from").notNullable().unique();
        table.string("to").notNullable();
        table.integer("visits").defaultTo(0);
        table.integer("user_id").unsigned().notNullable();
        table.timestamps(true, true);

        // Foreign key constraint
        table
            .foreign("user_id")
            .references("id")
            .inTable("users")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
    return knex.schema.dropTable("short_urls");
}
