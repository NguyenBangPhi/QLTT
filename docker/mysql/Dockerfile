# Forces the init client to utf8mb4, otherwise latin1 double-encodes Vietnamese on INSERT.
# Baked into the image because a bind-mounted .cnf is world-writable on Windows (MySQL
# refuses it) and --skip-character-set-client-handshake is gone in MySQL 8.4.
FROM mysql:8.4
COPY charset.cnf /etc/mysql/conf.d/charset.cnf
RUN chmod 0644 /etc/mysql/conf.d/charset.cnf && chown root:root /etc/mysql/conf.d/charset.cnf
