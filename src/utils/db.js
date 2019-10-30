import Sequelize from 'sequelize';

const sequelize = new Sequelize('postgres://gorm:gorm@localhost:5432/gorm');

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
  await sequelize.sync();

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
    await storeFile(obj.screenshot.ticketId, obj.screenshot.filename, obj.data);
  }
};

export default { getNewTickets, closeTicketById, storeFile, saveArtifacts };