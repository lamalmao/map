const points = [
  [47.222036, 39.720376, 'Парк в центре', [
      'Таким образом рамки и место обучения кадров требуют от нас анализа модели развития. Разнообразный и богатый опыт рамки и место обучения кадров играет важную роль в формировании систем массового участия. Равным образом дальнейшее развитие различных форм деятельности в значительной степени обуславливает создание направлений прогрессивного развития.',
      'С другой стороны начало повседневной работы по формированию позиции позволяет выполнять важные задания по разработке соответствующий условий активизации. Разнообразный и богатый опыт укрепление и развитие структуры требуют определения и уточнения системы обучения кадров, соответствует насущным потребностям.'
    ], 'https://google.com', 'ул. какая-то там 1'],
  [47.222590, 39.714314, 'Сюда лучше не ходить', [
    'Товарищи! новая модель организационной деятельности представляет собой интересный эксперимент проверки существенных финансовых и административных условий. Товарищи! реализация намеченных плановых заданий играет важную роль в формировании модели развития. Таким образом укрепление и развитие структуры играет важную роль в формировании соответствующий условий активизации. Значимость этих проблем настолько очевидна, что реализация намеченных плановых заданий в значительной степени обуславливает создание направлений прогрессивного развития. Не следует, однако забывать, что постоянный количественный рост и сфера нашей активности позволяет оценить значение существенных финансовых и административных условий. Значимость этих проблем настолько очевидна, что постоянное информационно-пропагандистское обеспечение нашей деятельности обеспечивает широкому кругу (специалистов) участие в формировании новых предложений.'
  ], 'https://ya.com', 'ул. какая-то там 2'],
  [47.227971, 39.726737, 'А вот сюда лучше ходить', [
    'Повседневная практика показывает, что реализация намеченных плановых заданий играет важную роль в формировании новых предложений.',
    'Товарищи! постоянное информационно-пропагандистское обеспечение нашей деятельности позволяет оценить значение системы обучения кадров, соответствует насущным потребностям. Разнообразный и богатый опыт новая модель организационной деятельности позволяет оценить значение модели развития. С другой стороны начало повседневной работы по формированию позиции представляет собой интересный эксперимент проверки системы обучения кадров, соответствует насущным потребностям.',
    'Задача организации, в особенности же рамки и место обучения кадров представляет собой интересный эксперимент проверки системы обучения кадров, соответствует насущным потребностям.'
  ], 'https://vk.com', 'ул. какая-то там 3'],
  [47.236081, 39.723240, 'Тыгыдык', [
    'Таким образом начало повседневной работы по формированию позиции способствует подготовки и реализации новых предложений. '
  ], 'https://mail.ru', 'ул. какая-то там 4']
];

var aboutWindow = document.getElementById('location-about');
var aboutData = document.getElementById('location-data');
var closeButton = document.getElementById('about-close');
var center = [47.228645, 39.715989];
var zoom = window.innerWidth > 1100 ? 15 : 14;
var map;

closeButton.onclick = close;

class Point {
  constructor(alt, lon, name, paragraphs, link, address) {
    this.alt = alt;
    this.lon = lon;
    this.name = name;
    this.paragraphs = paragraphs;
    this.link = link;
    this.address = address;
  }

  get coords() {
    return [this.alt, this.lon];
  }

  static Points = new Map();

  draw = function(e) {
    console.log(e);

    e.innerHTML = '';
    
    let header = document.createElement('h2');
    header.className = 'text about-header';
    header.innerHTML = this.name;
    e.appendChild(header);

    for (let paragraph of this.paragraphs) {
      let p = document.createElement('p');
      p.className = 'text about-text';
      p.innerHTML = paragraph;

      e.appendChild(p);
    }
    
    let link = document.createElement('a');
    link.href = this.link;
    link.className = 'about-link';
    link.innerHTML = 'Ссылка'
    e.appendChild(link);

    let address = document.createElement('p');
    address.className = 'text about-address';
    address.innerHTML = this.address;
    e.appendChild(address);

    aboutWindow.style.display = 'block';
  }
}

for (let point of points) {
  Point.Points.set(point[2], new Point(point[0], point[1], point[2], point[3], point[4], point[5]));
}


function fillMenu() {
  const menu = document.getElementById('menu');

  for (pointData of Point.Points) {
    // console.log(pointData);

    let point = document.createElement('li');
    point.className = 'points-item';
    point.innerHTML = pointData[0];
    point.onclick = moveFromTag;
    point.setAttribute('coordinates', pointData[1].coords.join(';'));

    menu.appendChild(point);
  }
}

fillMenu();

ymaps.ready(init);
function init() {
  map = new ymaps.Map('map', {
    center: center,
    zoom: zoom,
    controls: []
  });

  for (let point of Point.Points) {
    let geo = new ymaps.GeoObject({
      geometry: {
        type: 'Point',
        coordinates: point[1].coords
      },
      properties: {
        iconContent: point[0]
      }
    }, {
      preset: 'islands#blackStretchyIcon'
    });
    geo.target = point.name;

    geo.events.add(['click'], e => {
      const targetName = e.get('target').properties._data.iconContent;
      const target = Point.Points.get(targetName);

      move(target);
    });

    map.geoObjects.add(geo);
  }
}


function move(target) {
  const coordinates = target.coords;

  console.log(target);

  map.setCenter(coordinates);
  map.setZoom(19);

  target.draw(aboutData);
}

function moveFromTag() {
  // const coordinates = this.getAttribute('coordinates').split(';');

  const target = Point.Points.get(this.innerHTML);
  
  move(target);
}

function close() {
  console.log('close');
  
  aboutWindow.style.display = 'none';
}

function reset() {
  map.setCenter(center);
  map.setZoom(zoom);
  close();
}