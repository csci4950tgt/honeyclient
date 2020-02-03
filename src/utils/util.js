export default {
  isValidTicketId(ticketId) {
    ticketId = parseInt(ticketId);

    return Number.isInteger(ticketId) && ticketId > 0;
  },
};
