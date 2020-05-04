const { inspect } = require('util');
const { createLogger, format, transports } = require('winston');

// Original logger config created by Hernan Rajchert https://github.com/hrajchert
const logger = createLogger({
  level: 'info',
  transports: [
    new transports.Console({
      format: format.combine(
        format.align(),
        format.colorize({
          level: true,
        }),
        format.printf(({ level, message, ...extra }) => {
          const splat = extra[Symbol.for('splat')] || [];
          return [
            `${level}: ${message}`,
            ...splat
              .map((any) => inspect(any))
              // Indent every item in the splat with a tab, and make sure that if the string
              // has a new line, that line is also indented
              .map((str) => `\t${str.replace(/\n/g, '\n\t')}`),
          ].join('\n');
        }),
      ),
    }),
  ],
});

module.exports = logger;
