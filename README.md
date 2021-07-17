# ![Reminders](project-logo.png)

## Общая информация

Можно посмотреть на Github Pages - https://yegoryurchenko.github.io/Reminders-interactive/

Этот репозиторий содержит `только Frontend`

Задание - https://github.com/A-Lena375/_Test_/blob/master/%D0%A2%D0%B5%D1%81%D1%82%D0%BE%D0%B2%D0%BE%D0%B5%20%D0%B7%D0%B0%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5%20-%20Fullstack%20Web%20Developer.mdhttps://github.com/Chaptykov/VKFrontendTask

Используемые технологии: JavaScript, HTML, SCSS, Underscore (template), Axios, Webpack

При работе со сборкой использовался [Node.js](https://nodejs.org/en/) версии [12.16.1](https://nodejs.org/download/release/v12.16.1/)

## Установка

1. Клонируйте репозиторий: `git clone https://github.com/YegorYurchenko/Reminders.git`
1. Перейдите в папку проекта `Reminders` и выполните команду `npm install`, которая автоматически установит все зависимости, указанные в `package.json`
1. После окончания установки в корне проекта появится каталог `node_modules` со всеми зависимостями

## Запуск

1. `npm start` - запуск сборки в режиме разработки. После запуска сборки заработает локальный сервер по адресу `http://localhost:3000`
1. `npm run production`- создаст итоговую версию проекта для production

## Структура проекта

* `app` - исходники
    * `common` - общие файлы (шрифты, изображения, стили, скрипты, данные)
        * `data` - JSON-файлы для AJAX-запросов
        * `fonts` - шрифты
        * `images` - изображения
        * `scripts` - скрипты
        * `styles` - стили
        * `svg` - svg-иконки
    * `components` - компоненты
        * `header`
        * `new-remind-item` - popup для создания/изменения Remind
        * `reminders` - список всех Reminds
        * `select-date` - popup для выбора даты
        * `select-time` - popup для выбора времени
        * `templates` - шаблоны для AJAX
    * `layout` - шаблоны для страниц
        * `footer.html`
        * `header.html`
    * `pages` - страницы
* `dist` - собранная верстка (для production)
    * `assets` - статические файлы
        * `css` - стили
        * `fonts` - шрифты
        * `images` - изображения
        * `js` - скрипты
    * `data` - JSON-файлы для AJAX-запросов
    * `index.html` - главная html-страница
* `package.json`
* `webpack.config.babel.js` - файл конфигурации Webpack
