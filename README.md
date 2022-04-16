Документация для решения задачи Middle №2
====

Условия задачи:
----
1. Написать парсер, получающий список всех фильмов премьер с сайта "[Кинопоиск](https://www.kinopoisk.ru/premiere/ru/)"
2. Сформировать json, содержащий данные о фильмах
    a. __name__ _- название фильма_<br>
    b. __name_eng__ _- название фильма на английском_<br>
    c. __film_link__ _- ссылка на страницу фильма_<br>
    d. __film_rating__ _- рейтинг фильма (__если есть__)_<br>
    e. __wait_rating__ _- рейтинг ожидания (__если есть__)_<br>
    f. __votes__ _- количество голосов_<br>
    g. __date__ _- дата премьеры_<br>
    h. __company__ _- компания, выпускающая фильм_<br>
    i. __genres__ _- жанры фильма (__массив__)_

Для решения задачи использовались:
----
Редактор: _Visual Studio Code_<br>
Язык программирования: _JavaScript_<br>
Фреймворк: _Node.js_<br>
Библиотеки: _puppeteer, fs_

Запуск
----
1. Для запуска программы нужно установит фреймворк __Node.js__. 
2. Через консоль/терминал перейти в место расположения фаила.
3. В консоли/терминале нужно написать __"npm i"__ и дождаться загрузки.
4. В консоли/терминале нужно написать __"node Junior_Task_2.js"__.