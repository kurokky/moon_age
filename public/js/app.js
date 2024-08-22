const indexs = {
  "kana":["にちよう","げつよう","かよう","すいよう","もくよう","きんよう","どよう"],
  "kanji":["日","月","火","水","木","金","土"],
  "en":["Sun","Mon","The","Wed","Thu","Fri","Sat"]
}

const moonTypes = {
  "kana":{"new_moon":"しんげつ","full_moon":"まんげつ","half_moon":"はんげつ"},
  "kanji":{"new_moon":"新月","full_moon":"満月","half_moon":"半月"},
  "en":{"new_moon":"New moon","full_moon":"Full moon","half_moon":"Half moon"},
}

const moonAges = {
  "kana":"げつれい",
  "kanji":"月齢",
  "en":"Moon phase",
}

const months = {
  "kana":["1がつ","2がつ","3がつ","4がつ","5がつ","6がつ","7がつ","8がつ","9がつ","10がつ","11がつ","12がつ"],
  "kanji":["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
  "en":["Jan.","Feb.","Mar.","Apr.","May.","June.","July","Aug.","Sep.","Oct.","Nov.","Dec."],
}

const prefixs = {
  "kana":{"month":"がつ","year":"ねん","hour":"じ"},
  "kanji":{"month":"月","year":"年","hour":"時"},
}

function getPageType(){
  return parseInt(document.getElementById('page').value);
}


function getTermType(){
  return parseInt(document.getElementById('term').value);
}

function checkColor(){
  if (document.getElementById('color').value == "1"){
    document.querySelector("main").className = "color"
    return  
  }
  document.querySelector("main").className = ""
}


function makeTemplate(){
  const dom = document.querySelector("main");
  dom.insertAdjacentHTML('beforeend', `<section><h1></h1><table></table></section>`);
}

function getLastTemplate(){
  const dom = document.querySelectorAll("section")
  return dom.length ? dom[dom.length-1] : false;
}


function getLangType(){
  const elems = document.getElementsByName('lang_type');
  let type = "kana";
  for(const elm of elems){
    if (!elm.checked){
      continue;
    }
    type = elm.value;
  }
  return type
}

function setHeader(){
  const dom = getLastTemplate();
  if (!dom)  return false;
  const calendar = dom.querySelector("table")
  let tr = document.createElement("tr");
  const ths = indexs[getLangType()]
  for(const th of ths){
    const td = document.createElement("th");
    td.textContent = th
    tr.appendChild(td)
  }
  calendar.appendChild(tr)
}

function setTitle(year, month){
  const dom = getLastTemplate();
  if (!dom)  return false;

  const title = dom.querySelector('h1')
  let type = getLangType();
  if (type == "en"){
    title.textContent = `${year} ${months[type][month-1]}`
    return
  }
  title.textContent = `${year}${prefixs[type]["year"]} ${months[type][month-1]}`
}

function getYearMonth(){
  const ym = document.getElementById('ym').value.split("-");
  return {"year":parseInt(ym[0]),"month":parseInt(ym[1])}
}


function getDays(year, month){
    const date = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0).getDate();
    const endOfLastMonth = new Date(year, month - 1, 0).getDate();
    const firstDayIndex = date.getDay();
    const lastDayIndex = new Date(year, month - 1, lastDay).getDay();
    const days = [];
    for (let i =  (endOfLastMonth - firstDayIndex) + 1 ; i <= endOfLastMonth; i++) {
      const isHoliday = holiday_jp.isHoliday(new Date(year, month - 2, i));
      days.push({"index":i,"isHoliday":isHoliday ,"ignore":true})
    }
    for (let i = 1; i <= lastDay; i++) {
      const isHoliday = holiday_jp.isHoliday(new Date(year, month - 1, i));
      days.push({"index":i,"isHoliday":isHoliday,"ignore":false})
    }
    for (let i = 1; i <= 6 - lastDayIndex; i++){
      const isHoliday = holiday_jp.isHoliday(new Date(year, month, i));
      days.push({"index":i,"isHoliday":isHoliday,"ignore":true})
    }
    return days
}

function createCalendarTable(days, hour, min) {
  const template = getLastTemplate();
  if (!template) return false;

  const calendar = template.querySelector("table");
  const { year, month } = getYearMonth();
  let tr = document.createElement("tr");
  days.forEach( (day, i) => {
    if (i%7 == 0){
      tr = document.createElement("tr");
    }
    const td = createTableCell(day, year, month, hour, min);
    tr.appendChild(td);
    calendar.appendChild(tr);
    if (i%7 == 0){
      calendar.appendChild(tr)
    }
  });
}

function createTableCell(day, year, month, hour, min) {
    const td = document.createElement("td");
    const p  = document.createElement("p");
    const strong  = document.createElement("strong");
    const time = document.createElement("time")
    strong.textContent = day["index"]
    p.appendChild(strong)
    td.appendChild(p);
    if (day["isHoliday"]) td.classList.add("rest_day");
    
    if (day["ignore"]){
      td.classList.add("ignore")
      td.appendChild(time)
      return td;
    }
    const selectedDate = new Date(year, month - 1, day["index"], hour, min);
    const moonDate = getMoonDeta(selectedDate);
    td.dataset.type = getMoonPhaseType(moonDate.age);
    setMoonAge(time ,moonDate.age);
    drawBaseMoon(td, moonDate.rotation);
    td.appendChild(time);
    return td;
}

function setMoonAge(time ,age){
  if (age.toFixed(0) == 15){
      time.textContent =  moonTypes[getLangType()]["full_moon"]
      time.classList.add("full_moon");
    }else if (age.toFixed(0) == 0 || age.toFixed(0) == 30){
      time.textContent = moonTypes[getLangType()]["new_moon"]
      time.classList.add("new_moon");
    }else{
      time.textContent = `${moonAges[getLangType()]} ${age.toFixed(1)}`
    }
}

function getMoonPhaseType(age) {
  const fixedAge = age.toFixed(2);
  switch (true) {
    case fixedAge < 8.0:
      return 0;
    case fixedAge < 17.0:
      return 1;
    case fixedAge < 22.0:
      return 2;
    default:
      return 3;
  }
}


function getMoonDeta(date){
  const cycleLength = 29.5 // days
  //const knownNewMoon = new Date('2022-03-02 18:34:00')
  const knownNewMoon = new Date('2022-03-03 18:34:00')
  const secondsSinceKnownNewMoon = (date - knownNewMoon) / 1000
  const daysSinceKnownNewMoon = secondsSinceKnownNewMoon / 60 / 60 / 24
  const currentMoonPhasePercentage = (daysSinceKnownNewMoon % cycleLength) / cycleLength
  //月齢
  const age = daysSinceKnownNewMoon % cycleLength;
  return {
    rotation: 360 - Math.floor(currentMoonPhasePercentage * 360),
    age: age
  };
}

function drawBaseMoon(dom , deg){
  const sphere = document.createElement("div");
  sphere.classList.add("sphere");

  const light = document.createElement("div");
  const dark = document.createElement("div");

  light.classList.add("hemisphere", deg < 180 ? "light" : "dark");
  dark.classList.add("hemisphere", deg < 180 ? "dark" : "light");

  const divider = document.createElement("div");
  divider.classList.add("divider");
  divider.style.transform = `rotate3d(0, 1, 0, ${deg}deg)`;

  sphere.append(light, dark, divider);
  dom.appendChild(sphere);
}

function setMoonTitle(date){
  document.querySelector('#date-title').innerHTML = `Moon phase for ${date.toLocaleString()}`
}


function displayCalendar(){
  document.querySelector("main").innerHTML = ""
  const {year, month} =  getYearMonth();
  const [hour, min]  = document.getElementById('time').value.split(":");
  const term = getTermType();
  const page = getPageType();
  let pageAdd = [0];
  if (term > 1){
    pageAdd = page === 0 ? [...Array(term)].map((_, i) => i) : [0,2,1,3,4,6,5,7,8,10,9,11];
    if (term === 6) pageAdd.splice(6, term);
  }
  for (let i of  pageAdd){
    const selectedDate = new Date(year, (month + i) - 1, 1, hour, min);
    const temp_year    = selectedDate.getFullYear();
    const temp_month  = selectedDate.getMonth() +1;
    makeTemplate();
    setHeader();
    setTitle(temp_year, temp_month);
    const days = getDays(temp_year, temp_month);
    createCalendarTable(days, hour, min);
  }
  checkColor();
}

function initialize(){
  const today = new Date();
  const ym = document.getElementById('ym');
  const time = document.getElementById('time');
  ym.value = today.toISOString().slice(0, 7);
  time.value = '20:00';

  displayCalendar();
}

initialize()
