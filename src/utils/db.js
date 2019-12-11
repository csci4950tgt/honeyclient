import Sequelize from 'sequelize';
import PGPubsub from 'pg-pubsub';

console.log('Connecting to database...');

const getDBConnectionURI = () => {
  // get ENV variables for initializing database
  const user = process.env.PG_USER || 'gorm';
  const password = process.env.PG_PASSWORD || 'gorm';
  const database = process.env.PG_DB || 'gorm';
  const host = process.env.PG_HOST || 'localhost';
  const port = process.env.PG_PORT || '5432';
  // return "postgres://gorm:gorm@localhost:5432/gorm"
  return `postgres://${user}:${password}@${host}:${port}/${database}`;
};

const dbConnectionURI = getDBConnectionURI();

const sequelize = new Sequelize(dbConnectionURI, {
  logging: false,
});
const pubsubInstance = new PGPubsub(dbConnectionURI);

const Ticket = sequelize.define(
  'Ticket',
  {
    id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true },
    name: { type: Sequelize.STRING, allowNull: false },
    url: { type: Sequelize.STRING, allowNull: false },
    processed: { type: Sequelize.BOOLEAN },
  },
  {
    timestamps: true,
    underscored: true,
  }
);

const ScreenShot = sequelize.define(
  'ScreenShot',
  {
    id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true },
    TicketId: { type: Sequelize.INTEGER, allowNull: false },
    width: { type: Sequelize.INTEGER, allowNull: false },
    height: { type: Sequelize.INTEGER, allowNull: false },
    filename: { type: Sequelize.STRING, allowNull: false },
    userAgent: { type: Sequelize.STRING },
  },
  {
    timestamps: true,
    underscored: true,
  }
);

const FileArtifact = sequelize.define(
  'FileArtifact',
  {
    ticketId: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true },
    filename: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
    data: { type: Sequelize.BLOB },
  },
  {
    timestamps: false,
    underscored: true,
  }
);

Ticket.hasMany(ScreenShot, { foreignKey: 'ticket_id' });

const getNewTickets = async () => {
  // pull in associations:
  await sequelize.sync({
    logging: false,
  });

  // find unprocessed tickets, with their screenshot objects:
  return Ticket.findAll({ where: { processed: false }, include: [ScreenShot] });
};

const closeTicketById = ticketId => {
  return Ticket.update({ processed: true }, { where: { id: ticketId } });
};

const storeFile = async (ticketId, filename, buf) => {
  await FileArtifact.create({ ticketId, filename, data: buf });
};

const saveArtifacts = async artifacts => {
  console.log('Saving artifacts to database...');
  for (let obj of artifacts) {
    await storeFile(obj.ticketId, obj.filename, obj.data);
  }
};
//this is where is connecting with postgres and we need to connect with express
const registerUpdateHandler = fn => {
  pubsubInstance.addChannel('update', fn);
};

const getTicket = ticketId => {
  const tickets = Ticket.findAll({
    where: { id: ticketId },
    include: [ScreenShot],
  });
  return tickets[0];
};

export default {
  getNewTickets,
  closeTicketById,
  storeFile,
  saveArtifacts,
  registerUpdateHandler,
  getTicket,
};
