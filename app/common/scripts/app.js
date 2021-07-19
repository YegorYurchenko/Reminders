// import styles
import '../styles/app.scss';

export const ReminderSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/'
);

// components
import '../../components/header/header.js';
import '../../components/reminders/reminders.js';
import '../../components/new-remind-item/new-remind-item.js';
import '../../components/select-date/select-date.js';
import '../../components/select-time/select-time.js';
