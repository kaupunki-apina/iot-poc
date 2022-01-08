type PostgresOpts = {
  user: string;
  pass: string;
  host: string;
  port: string;
  db: string;
};
export const postgresUrl = ({ user, pass, host, port, db }: PostgresOpts) =>
  `postgres://${user}:${pass}@${host}:${port}/${db}?ssl=true`;
