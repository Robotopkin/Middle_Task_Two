const puppeteer = require('puppeteer'); //Библиотека
const fs = require("fs");   //Библиотека

class Movie //Класс для заполнения информации
    {
        constructor(name, name_eng, film_link, film_rating,wait_rating, votes, date, company, genres)
        {
            this.name =name;
            this.name_eng=name_eng;
            this.film_link=film_link;
            this.film_rating=film_rating;
            this.wait_rating=wait_rating;
            this.votes=votes;
            this.date=date;
            this.company=company;
            this.genresk=genres;
        }
    }

function waiting(min, max) {    //Функция создания рандомного промежутка для таймера, чтобы не появлялась капча от Яндекс
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const films=[]; //Массив для итогового заполнения
async function start(){

    const browser = await puppeteer.launch({headless: false});  //Запускается браузер Chromium, "false" открывается окно браузера, если стоит "true" то вычесления проходят без открытого окна, но если появится капча Яндекс об этом не узнать
    await setTimeout(function(){}, waiting(3000,7000)); //Таймера, чтобы не появлялась капча от Яндекс
    const page = await browser.newPage();   //Создается новая вкладка в браузере
    await page.goto(`https://www.kinopoisk.ru/premiere/ru/`);   //Загружается страница кинопоиска
    await page.setViewport({width: 1200, height: 800}); //Размер страници

    await page.waitForSelector('div.prem_list > div.premier_item > span', { timeout: 1000 });  //Ожидает прогрузки указанного селектора
    
    await autoScroll(page); //Прокручивает страницу в низ для обнавления всех фильмов, так как они прогружаются при прокручивание до низа

    const name = await page.$$eval('div.prem_list > div.premier_item > div.text > div > span:nth-child(1) > a', postLinks => postLinks.map((el) =>el.innerText));   //Находит все названия
    const sumFilms = name.length;
    const ne = await page.$$eval('div.prem_list > div.premier_item > div.text > div > span:nth-child(2)', postLinks => postLinks.map((el) =>el.innerText)); //Находит все названия на английском
    const name_eng=[];
    const film_link = await page.$$eval('div.text > div > span:nth-child(1) > a', postLinks => postLinks.map((el) =>el.href));  //Находит ссылка на страницы фильмов
    const rating = await page.$$eval('div.prem_list > div.premier_item > span', postLinks => postLinks.map((el) =>el.innerText));   //Находит все рейтинги (фильма и ожидания)
    const film_rating=[];
    const wait_rating=[];
    const votes = await page.$$eval('div.prem_list > div.premier_item > span > i > u > b', postLinks => postLinks.map((el) =>el.innerText));    //Находит кол-во голосов
    const date = await page.$$eval('div.prem_list > div.premier_item > meta:nth-child(1)', postLinks => postLinks.map((el) =>el.content));      //Находит даты премьеры
    const company = await page.$$eval('div.prem_list > div.premier_item > div.prem_day > s', postLinks => postLinks.map((el) =>el.innerText));  //Находит компании, выпускающии фильмы
    const genres =[];
    let j=0;

    for (let url of film_link) {    //Переходит по всем ссылкам на фильмы и там находит их жанры
        while(true){
            try{
                await setTimeout(function(){}, waiting(3000,7000));
                await page.goto(url);
                g = await page.$eval('div.styles_root__B1q5W.styles_root__axj8R > div.styles_root__UtArQ > div > div.styles_column__r2MWX.styles_md_17__FaWtp.styles_lg_21__YjFTk.styles_column__5dEFP > div > div > div:nth-child(2) > div.styles_column__r2MWX.styles_md_11__UdIH_.styles_lg_15__Ai53P > div > div:nth-child(3) > div:nth-child(2)', (el) =>el.innerText);
                genres[j]=g.replace(/\nслова/g, '').split(','); //Преобразует найденое в массив
                break;
            } catch(err){
                await setTimeout(function(){}, waiting(3000,7000));
                await page.reload(url); //Если не смог найти жанры перезагружает страницу
                continue;
            }
        }
        j++;
    }

    function getRating(rat){    //Функция для удаления не нужного содержимого, "рейтинг фильма",  "рейтинг ожидания", кол-во голсов и т.п.
        let r1 = '';
        let r2 = '';
        r1=rat.replace(/[^0-9,.,%,—]/g, '');
        if(r1[0]=="—") r2=r1.substring(0, 1);
        else if (r1[1]==".") r2=r1.substring(0, 4);
        else if (r1[2]=="%") r2=r1.substring(0, 3);
        return r2
    }

    for(let i =0; i<sumFilms; i++){ //Разделяет рейтинг на рейтинг фильма и рейтинг ожидания
        if(rating[i].indexOf('ожиданий') == -1){
            film_rating[i]=getRating(rating[i]);
            wait_rating[i]=null;
        }
        else if(rating[i].indexOf('фильма') == -1){
            film_rating[i]=null;
            wait_rating[i]=getRating(rating[i]);
        }
    }
    await browser.close();  //Закрывает браузер

    for(let i=0; i<sumFilms; i++){  //Заполняет массив
        name_eng[i]=ne[i].substr(0,ne[i].indexOf("(")); //Убирает не нужную дату которая находится вместе с английским названием
        films[i]= new Movie(name[i], name_eng[i], film_link[i], film_rating[i], wait_rating[i], votes[i], date[i], company[i], genres[i])
        if(film_rating[i]==null) delete films[i].film_rating;   //Удаляет рейтинг фильма там где его нет(вместо него рейтинг ожидания)
        if(wait_rating[i]==null) delete films[i].wait_rating;   //Удаляет рейтинг ожидания там где его нет(вместо него рейтинг фильма)
    }
    fs.writeFileSync("./Middle_Task_2.json",JSON.stringify(films, null, '\t')); //Преобразует это все в json и создает или перезарисывает существующий
}
start() //Ощеее время выполнения  в районе 260сек

async function autoScroll(page){    //Функция для прокруткаи страници
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            const distance = 100;
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}