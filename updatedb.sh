# rm -R drizzle
rm src/lib/server/db/development.db
pnpm db:push
pnpm db:seed