console.clear();
console.log('SVG pattern doodler');

//---

const DEBUG = false;

const MATHPI_180 = Math.PI / 180;

const SVG_NAMESPACE_URI = 'http://www.w3.org/2000/svg';

const SPEED = 1;
const PAUSE = 3000;

const LINE_WIDTH = 1;
const LINE_COLOR = 'rgba(0, 0, 0, 1.00)';
const LINE_CAP = 'square'; //square, butt or round

const SHAPE_RENDERING = 'optimizeSpeed'; //auto, optimizeSpeed, crispEdges, geometricPrecision

const BG_COLOR = 'rgba(255, 250, 244, 1.00)';

let w = 500;
let h = 500;

let guiSetting = null;
let gui = null;

let interval = null;
let timeout = null;

let canvas = null;

let bg = null;

let grid = null;
let gridCounter = 0;
let gridPosition = null;

let gridSize = 35;
let gridCellWidth = w / gridSize;
let gridCellHeight = h / gridSize;
let gridCellSizeMax = 3;

let history = [];
let historyIndex = history.length - 1;

const colors = [

[

{ r: 242, g: 99, b: 137 },
{ r: 97, g: 65, b: 166 },
{ r: 50, g: 139, b: 217 },
{ r: 242, g: 155, b: 48 },
{ r: 242, g: 71, b: 56 }],


[

{ r: 46, g: 123, b: 140 },
{ r: 20, g: 38, b: 38 },
{ r: 191, g: 145, b: 105 },
{ r: 140, g: 74, b: 59 },
{ r: 191, g: 167, b: 164 }],


[

{ r: 220, g: 220, b: 210 },
{ r: 35, g: 35, b: 30 }],


[

{ r: 242, g: 242, b: 242 },
{ r: 209, g: 209, b: 209 },
{ r: 169, g: 169, b: 169 },
{ r: 89, g: 89, b: 89 },
{ r: 44, g: 44, b: 44 }],


[

{ r: 72, g: 89, b: 34 },
{ r: 121, g: 140, b: 53 },
{ r: 180, g: 191, b: 94 },
{ r: 36, g: 38, b: 20 },
{ r: 242, g: 242, b: 242 }],


[

{ r: 242, g: 242, b: 242 },
{ r: 166, g: 117, b: 27 },
{ r: 242, g: 174, b: 46 },
{ r: 242, g: 199, b: 119 },
{ r: 13, g: 13, b: 13 }],


[

{ r: 88, g: 122, b: 166 },
{ r: 121, g: 190, b: 217 },
{ r: 187, g: 191, b: 69 },
{ r: 191, g: 169, b: 149 },
{ r: 95, g: 83, b: 77 }],


[

{ r: 166, g: 41, b: 64 },
{ r: 242, g: 235, b: 220 },
{ r: 214, g: 187, b: 151 },
{ r: 234, g: 141, b: 19 },
{ r: 217, g: 82, b: 82 }]];





let color = null;

//---

const randomInteger = function (min, max) {

  return Math.floor(Math.random() * (max - min + 1)) + min;

};

const clamp = function (value, min, max) {

  return Math.min(Math.max(value, min), max);

};

const randomBetween = function (min, max) {

  return Math.floor(Math.random() * (max - min + 1) + min);

};

//---

function init() {

  canvas = createCanvas(w, h, 'container');

  //---

  restart();

}

function initGUI() {

  const controlRestart = () => {

    restart();

  };

  const controlStop = () => {

    stop();

  };

  const setCanvasWidth = () => {

    setCanvasSize(guiSetting['Canvas width'], guiSetting['Canvas height']);

  };

  const setCanvasHeight = () => {

    setCanvasSize(guiSetting['Canvas width'], guiSetting['Canvas height']);

  };

  const setCanvasSize = (width, height) => {

    stop();
    clearHistory();

    w = width;
    h = height;

    canvas.setAttribute('width', w);
    canvas.setAttribute('height', h);
    canvas.width = w;
    canvas.height = h;

    const container = document.getElementById('container');

    container.style.width = w + 'px';
    container.style.height = h + 'px';

    gridSize = guiSetting['Grid size'];
    gridCellWidth = w / gridSize;
    gridCellHeight = h / gridSize;

    restart();

  };

  const setGridSize = () => {

    stop();
    clearHistory();

    gridSize = guiSetting['Grid size'];
    gridCellWidth = w / gridSize;
    gridCellHeight = h / gridSize;

    restart();

  };

  const setCellSizeMax = () => {

    stop();
    clearHistory();

    gridCellSizeMax = guiSetting['Cell size max'];

    restart();

  };

  const controlHistoryPrevious = () => {

    stop();

    historyIndex--;

    if (historyIndex < 0) {

      historyIndex = 0;

    }

    canvas.innerHTML = '';
    canvas.innerHTML = history[historyIndex];

    guiSetting['Current Image'] = (historyIndex + 1).toString();

  };

  const controlHistoryNext = () => {

    stop();

    historyIndex++;

    if (historyIndex > history.length - 1) {

      historyIndex = history.length - 1;

    }

    canvas.innerHTML = '';
    canvas.innerHTML = history[historyIndex];

    guiSetting['Current Image'] = (historyIndex + 1).toString();

  };

  const controlDownloadSVG = () => {

    stop();

    canvas.setAttribute('xmlns', SVG_NAMESPACE_URI);

    const svgData = canvas.outerHTML;
    const preface = '<?xml version="1.0" standalone="no"?>\r\n';
    const svgBlob = new Blob([preface, svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');

    downloadLink.href = svgUrl;
    downloadLink.download = 'Doodle.svg';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

  };

  const controlDownloadPNG = () => {

    stop();

    const img = document.createElement('img');

    img.src = 'data:image/svg+xml;charset=utf-8,' + new XMLSerializer().serializeToString(canvas);
    img.onload = () => {

      const canvas = document.createElement('canvas');

      canvas.width = w;
      canvas.height = h;

      const context = canvas.getContext('2d');

      context.drawImage(img, 0, 0);

      canvas.toBlob(pngBlob => {

        const pngUrl = URL.createObjectURL(pngBlob);
        const downloadLink = document.createElement('a');

        downloadLink.href = pngUrl;
        downloadLink.download = 'Doodle.png';

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

      });

    };

  };

  const linkTo = () => {

    window.open('https://twitter.com/niklaswebdev', '_blank');

  };

  //---

  guiSetting = {

    'Restart': controlRestart,
    'Stop': controlStop,
    'Canvas width': w,
    'Canvas height': h,
    'Grid size': gridSize,
    'Cell size max': gridCellSizeMax,
    'Current Image': 0,
    'Total Images': 0,
    '&rarr; Previous image': controlHistoryPrevious,
    '&larr; Next image': controlHistoryNext,
    'Download SVG': controlDownloadSVG,
    'Download PNG': controlDownloadPNG,
    '@niklaswebdev': linkTo };



  gui = new dat.GUI();
  gui.close();
  gui.add(guiSetting, 'Restart');
  gui.add(guiSetting, 'Stop');

  const dimensions = gui.addFolder('Dimensions');

  dimensions.add(guiSetting, 'Canvas width').min(128).max(2048).step(1).onChange(setCanvasWidth);
  dimensions.add(guiSetting, 'Canvas height').min(128).max(2048).step(1).onChange(setCanvasHeight);
  dimensions.add(guiSetting, 'Grid size').min(4).max(64).step(1).onChange(setGridSize);
  dimensions.add(guiSetting, 'Cell size max').min(1).max(10).step(1).onChange(setCellSizeMax);

  const imageStorage = gui.addFolder('Image storage');

  const currentImage = imageStorage.add(guiSetting, 'Current Image');
  currentImage.listen();
  currentImage.domElement.style.pointerEvents = 'none';

  const totalImages = imageStorage.add(guiSetting, 'Total Images');
  totalImages.listen();
  totalImages.domElement.style.pointerEvents = 'none';

  imageStorage.add(guiSetting, '&rarr; Previous image');
  imageStorage.add(guiSetting, '&larr; Next image');
  imageStorage.add(guiSetting, 'Download SVG');
  imageStorage.add(guiSetting, 'Download PNG');

  gui.add(guiSetting, '@niklaswebdev');

}

//---

function restart() {

  bg = createRect(0, 0, w, h, BG_COLOR);

  canvas.appendChild(bg);

  //---

  gridCounter = 0;
  grid = [];

  for (let y = 0, yl = gridSize; y < yl; y++) {

    const yGrid = [];

    for (let x = 0, xl = gridSize; x < xl; x++) {

      yGrid.push(0);

    }

    grid.push(yGrid);

  }

  //---

  color = colors[Math.floor(Math.random() * colors.length)];

  //---

  stop();

  //---

  interval = setInterval(() => {

    if (gridCounter >= gridSize * gridSize - 1) {

      clearInterval(interval);

      //---

      timeout = setTimeout(() => {

        canvas.innerHTML = '';

        restart();

      }, PAUSE);

    }

    //---

    if (gridCounter === 0) {

      gridPosition = getRandomGridPos();

    } else {

      gridPosition = getGridPosNearBy(gridPosition);

    }

    //---

    let gridCellSize = getCellSize(gridPosition, gridCellSizeMax);

    if (gridCellSize > 1) {

      gridCellSize = randomBetween(2, gridCellSize);

    }

    //---

    if (gridCellSize === 1) {

      grid[gridPosition.y][gridPosition.x] = 1;

      gridCounter++;

    } else {

      const xs = gridPosition.x;
      const ys = gridPosition.y;
      const xe = gridPosition.x + gridCellSize;
      const ye = gridPosition.y + gridCellSize;

      for (let y = ys; y < ye; y++) {

        for (let x = xs; x < xe; x++) {

          if (grid[y][x] === 0) {

            grid[y][x] = 1;

            gridCounter++;

          }

        }

      }

    }

    //---

    addGridCell(gridCellSize, gridPosition);

    //---

    if (gridCounter >= gridSize * gridSize) {

      history.push(canvas.innerHTML);
      historyIndex = history.length - 1;

      guiSetting['Current Image'] = (historyIndex + 1).toString();
      guiSetting['Total Images'] = history.length.toString();

    }

  }, SPEED);

}

function stop() {

  if (timeout !== null) {

    clearTimeout(timeout);

    timeout = null;

  }

  if (interval !== null) {

    clearInterval(interval);

    interval = null;

  }

}

//---

function clearHistory() {

  history = [];
  historyIndex = 0;

  guiSetting['Current Image'] = 0;
  guiSetting['Total Images'] = 0;

}

//---

function addGridCell(gridCellSize, gridPosition) {

  const position = { x: gridCellWidth * gridPosition.x, y: gridCellHeight * gridPosition.y };

  const patternIndex = Math.floor(Math.random() * patterns.length);
  const pattern = patterns[patternIndex];

  let randomIndex1 = Math.floor(Math.random() * color.length);
  let randomIndex2 = Math.floor(Math.random() * color.length);

  while (randomIndex1 === randomIndex2) {

    randomIndex2 = Math.floor(Math.random() * color.length);

  }

  const color1 = color[randomIndex1];
  const color2 = color[randomIndex2];

  const colorRandomDiff = 0; //25;

  const c1 = 'rgba(' + clamp(randomInteger(color1.r - colorRandomDiff, color1.r + colorRandomDiff), 0, 255) + ', ' + clamp(randomInteger(color1.g - colorRandomDiff, color1.g + colorRandomDiff), 0, 255) + ', ' + clamp(randomInteger(color1.b - colorRandomDiff, color1.b + colorRandomDiff), 0, 255) + ', 1.00)';
  const c2 = 'rgba(' + clamp(randomInteger(color2.r - colorRandomDiff, color2.r + colorRandomDiff), 0, 255) + ', ' + clamp(randomInteger(color2.g - colorRandomDiff, color2.g + colorRandomDiff), 0, 255) + ', ' + clamp(randomInteger(color2.b - colorRandomDiff, color2.b + colorRandomDiff), 0, 255) + ', 1.00)';

  pattern(position.x, position.y, gridCellSize * gridCellWidth, gridCellSize * gridCellHeight, [c1, c2]);

  //---

  if (DEBUG === true) {

    const debugText = document.createElement('div');

    debugText.innerHTML = (i + 1).toString();
    debugText.style.position = 'absolute';
    debugText.style.left = x + gridCellWidth / 2 - 10 + 'px';
    debugText.style.top = y + gridCellHeight / 2 - 10 + 'px';
    debugText.style.color = '#ffffff';
    debugText.style.fontSize = 'small';

    document.getElementById('container').appendChild(debugText);

  }

}

function getRandomGridPos() {

  const x = Math.floor(Math.random() * grid[0].length);
  const y = Math.floor(Math.random() * grid.length);

  return { x: x, y: y };

}

function getRandomFreeGridPos() {

  const newPositions = [];

  const xs = 0;
  const ys = 0;
  const xe = grid[0].length;
  const ye = grid.length;

  for (let y = ys; y < ye; y++) {

    for (let x = xs; x < xe; x++) {

      if (grid[y][x] === 0) {

        newPositions.push({ x: x, y: y });

      }

    }

  }

  if (newPositions.length === 1) {

    return newPositions[0];

  } else if (newPositions.length > 1) {

    return newPositions[Math.floor(Math.random() * newPositions.length)];

  } else {

    return null;

  }

}

function getGridPosNearBy(position, maxRadius = 100) {

  for (let radius = 1; radius < maxRadius; radius++) {

    const newPositions = [];

    const xs = position.x - radius;
    const ys = position.y - radius;
    const xe = position.x + radius;
    const ye = position.y + radius;

    for (let y = ys; y < ye; y++) {

      for (let x = xs; x < xe; x++) {

        if (x > -1 && x < gridSize && y > -1 && y < gridSize && grid[y][x] === 0) {

          newPositions.push({ x: x, y: y });

        }

      }

    }

    if (newPositions.length === 1) {

      return newPositions[0];

    } else if (newPositions.length > 1) {

      return newPositions[Math.floor(Math.random() * newPositions.length)];

    }

  }

}

function getCellSize(position, maxSize = 5) {

  if (maxSize === 1) {

    return 1;

  }

  let size = 0;

  for (let step = 1; step < maxSize + 1; step++) {

    const xs = position.x;
    const ys = position.y;
    const xe = position.x + step;
    const ye = position.y + step;

    let successCount = 0;
    let cellCount = 0;

    for (let y = ys; y < ye; y++) {

      for (let x = xs; x < xe; x++) {

        cellCount++;

        if (x > -1 && x < gridSize && y > -1 && y < gridSize && grid[y][x] === 0) {

          successCount++;

        }

      }

    }

    if (successCount === cellCount) {

      size = successCount / step;

    }

  }

  return size;

}

//---

Number.prototype.ts = Number.prototype.toString;

function drawPattern001(x, y, w, h, colors) {

  const points0 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + x.ts() + ',' + (y + h).ts();
  const points1 = (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createPolygon(points0, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern002(x, y, w, h, colors) {

  const points0 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();
  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();

  const pattern0 = createPolygon(points0, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern003(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createEllipse(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern004(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern005(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + (y + h / 2).ts() + ' ' + x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + y.ts();
  const points2 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts();
  const points3 = (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);
  const pattern3 = createPolygon(points3, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern006(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + (y + h / 2).ts() + ' ' + x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + y.ts();
  const points2 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts();
  const points4 = (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);
  const pattern4 = createPolygon(points4, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern4);

}

function drawPattern007(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + (y + h / 2).ts() + ' ' + x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + y.ts();
  const points3 = (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();
  const points4 = (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern3 = createPolygon(points3, colors[1]);
  const pattern4 = createPolygon(points4, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern3);
  canvas.appendChild(pattern4);

}

function drawPattern008(x, y, w, h, colors) {

  const points2 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts();
  const points3 = (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();
  const points4 = (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern2 = createPolygon(points2, colors[1]);
  const pattern3 = createPolygon(points3, colors[1]);
  const pattern4 = createPolygon(points4, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);
  canvas.appendChild(pattern4);

}

function drawPattern009(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w / 2, h, colors[0]);
  const pattern1 = createRect(x + w / 2, y, w / 2, h, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern010(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h / 2, colors[0]);
  const pattern1 = createRect(x, y + h / 2, w, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern011(x, y, w, h, colors) {

  const points1 = (x + w / 4).ts() + ',' + y.ts() + ' ' + (x + w - w / 4).ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 4).ts();
  const points2 = (x + w).ts() + ',' + (y + h / 4).ts() + ' ' + (x + w).ts() + ',' + (y + h - h / 4).ts() + ' ' + (x + w - w / 4).ts() + ',' + (y + h / 2).ts();
  const points3 = (x + w / 4).ts() + ',' + (y + h).ts() + ' ' + (x + w - w / 4).ts() + ',' + (y + h).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h - h / 4).ts();
  const points4 = x.ts() + ',' + (y + h / 4).ts() + ' ' + x.ts() + ',' + (y + h - h / 4).ts() + ' ' + (x + w / 4).ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);
  const pattern3 = createPolygon(points3, colors[1]);
  const pattern4 = createPolygon(points4, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);
  canvas.appendChild(pattern4);

}

function drawPattern012(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 90, 360, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern013(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 270, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern014(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 90, colors[1]);
  const pattern2 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 180, 360, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern015(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 270, 360, colors[1]);
  const pattern2 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 180, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern016(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 90, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern017(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 90, 180, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern018(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 180, 270, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern019(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 270, 360, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern020(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 90, colors[1]);
  const pattern2 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 180, 270, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern021(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 90, 180, colors[1]);
  const pattern2 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 270, 360, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern022(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 180, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern023(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 90, 270, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern024(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 180, 360, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern025(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 270, 90, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern026(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w, y + h, w / 2, 270, 360, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern027(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w, y, w / 2, 180, 270, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern028(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x, y, w / 2, 90, 180, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern029(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x, y + h, w / 2, 0, 90, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern030(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x, y + h, w / 2, 0, 90, colors[1]);
  const pattern2 = createCircleAdvanced(x + w, y, w / 2, 180, 270, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern031(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x, y, w / 2, 90, 180, colors[1]);
  const pattern2 = createCircleAdvanced(x + w, y + h, w / 2, 270, 360, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern032(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + x.ts() + ',' + (y + h / 2).ts();
  const points2 = (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern033(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();
  const points2 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern034(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + x.ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern035(x, y, w, h, colors) {

  const points1 = (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern036(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);


}

function drawPattern037(x, y, w, h, colors) {

  const points1 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern038(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 90, colors[1]);
  const pattern2 = createRect(x, y, w / 2, h / 2, colors[1]);
  const pattern3 = createRect(x, y + h / 2, w, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern039(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 90, 180, colors[1]);
  const pattern2 = createRect(x, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern3 = createRect(x, y, w, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern040(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 180, 270, colors[1]);
  const pattern2 = createRect(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern3 = createRect(x, y, w, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern041(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 270, 360, colors[1]);
  const pattern2 = createRect(x + w / 2, y, w / 2, h / 2, colors[1]);
  const pattern3 = createRect(x, y + w / 2, w, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern042(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 90, colors[1]);
  const pattern2 = createRect(x, y, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern043(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 90, 180, colors[1]);
  const pattern2 = createRect(x, y + h / 2, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern044(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 180, 270, colors[1]);
  const pattern2 = createRect(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern045(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 270, 360, colors[1]);
  const pattern2 = createRect(x + w / 2, y, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern046(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 90, colors[1]);
  const pattern2 = createRect(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern047(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 90, 180, colors[1]);
  const pattern2 = createRect(x + w / 2, y, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern048(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 180, 270, colors[1]);
  const pattern2 = createRect(x, y, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern049(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 270, 360, colors[1]);
  const pattern2 = createRect(x, y + h / 2, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern050(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 90, colors[1]);
  const pattern2 = createRect(x, y, w / 2, h / 2, colors[1]);
  const pattern3 = createRect(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern051(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 90, 180, colors[1]);
  const pattern2 = createRect(x, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern3 = createRect(x + w / 2, y, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern052(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 180, 270, colors[1]);
  const pattern2 = createRect(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern3 = createRect(x, y, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern053(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 270, 360, colors[1]);
  const pattern2 = createRect(x + w / 2, y, w / 2, h / 2, colors[1]);
  const pattern3 = createRect(x, y + w / 2, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern054(x, y, w, h, colors) {

  const points4 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 90, colors[1]);
  const pattern2 = createRect(x, y, w / 2, h / 2, colors[1]);
  const pattern3 = createRect(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern4 = createPolygon(points4, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);
  canvas.appendChild(pattern4);

}

function drawPattern055(x, y, w, h, colors) {

  const points4 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 90, 180, colors[1]);
  const pattern2 = createRect(x, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern3 = createRect(x + w / 2, y, w / 2, h / 2, colors[1]);
  const pattern4 = createPolygon(points4, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);
  canvas.appendChild(pattern4);

}

function drawPattern056(x, y, w, h, colors) {

  const points4 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 180, 270, colors[1]);
  const pattern2 = createRect(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern3 = createRect(x, y, w / 2, h / 2, colors[1]);
  const pattern4 = createPolygon(points4, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);
  canvas.appendChild(pattern4);

}

function drawPattern057(x, y, w, h, colors) {

  const points4 = (x + w / 2).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 270, 360, colors[1]);
  const pattern2 = createRect(x + w / 2, y, w / 2, h / 2, colors[1]);
  const pattern3 = createRect(x, y + w / 2, w / 2, h / 2, colors[1]);
  const pattern4 = createPolygon(points4, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);
  canvas.appendChild(pattern4);

}

function drawPattern058(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern059(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern060(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern061(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern062(x, y, w, h, colors) {

  const points1 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern063(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern064(x, y, w, h, colors) {

  const points2 = x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w / 2, h, colors[0]);
  const pattern1 = createRect(x + w / 2, y, w / 2, h, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern065(x, y, w, h, colors) {

  const points2 = (x + w / 2).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w / 2, h, colors[0]);
  const pattern1 = createRect(x + w / 2, y, w / 2, h, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern066(x, y, w, h, colors) {

  const points2 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w / 2, h, colors[1]);
  const pattern1 = createRect(x + w / 2, y, w / 2, h, colors[0]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern067(x, y, w, h, colors) {

  const points2 = (x + w / 2).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w / 2, h, colors[1]);
  const pattern1 = createRect(x + w / 2, y, w / 2, h, colors[0]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern068(x, y, w, h, colors) {

  const points2 = x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts() + ' ' + x.ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h / 2, colors[0]);
  const pattern1 = createRect(x, y + h / 2, w, h / 2, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern069(x, y, w, h, colors) {

  const points2 = (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h / 2, colors[0]);
  const pattern1 = createRect(x, y + h / 2, w, h / 2, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern070(x, y, w, h, colors) {

  const points2 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h / 2, colors[1]);
  const pattern1 = createRect(x, y + h / 2, w, h / 2, colors[0]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern071(x, y, w, h, colors) {

  const points2 = (x + w / 2).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h / 2, colors[1]);
  const pattern1 = createRect(x, y + h / 2, w, h / 2, colors[0]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern072(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createRect(x + w / 2, y, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern073(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createRect(x, y, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern074(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createRect(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern075(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createRect(x, y + h / 2, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern076(x, y, w, h, colors) {

  const points1 = (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern077(x, y, w, h, colors) {

  const points1 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern078(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern079(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern080(x, y, w, h, colors) {

  const points1 = (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern081(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern082(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern083(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + x.ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern084(x, y, w, h, colors) {

  const points1 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();
  const points2 = x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern085(x, y, w, h, colors) {

  const points1 = (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();
  const points2 = x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern086(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts();
  const points2 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern087(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + x.ts() + ',' + (y + h / 2).ts();
  const points2 = (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern088(x, y, w, h, colors) {

  const points2 = x.ts() + ',' + (y + h).ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 180, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern089(x, y, w, h, colors) {

  const points2 = x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 180, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern090(x, y, w, h, colors) {

  const points2 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + x.ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 90, 270, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern091(x, y, w, h, colors) {

  const points2 = (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + x.ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 90, 270, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern092(x, y, w, h, colors) {

  const points2 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 180, 360, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern093(x, y, w, h, colors) {

  const points2 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 180, 360, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern094(x, y, w, h, colors) {

  const points2 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 270, 90, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern095(x, y, w, h, colors) {

  const points2 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 270, 90, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern096(x, y, w, h, colors) {

  const points2 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 90, 360, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern097(x, y, w, h, colors) {

  const points2 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 270, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern098(x, y, w, h, colors) {

  const points3 = (x + w / 2).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 90, colors[1]);
  const pattern2 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 180, 360, colors[1]);
  const pattern3 = createPolygon(points3, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern099(x, y, w, h, colors) {

  const points3 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 270, 360, colors[1]);
  const pattern2 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 180, colors[1]);
  const pattern3 = createPolygon(points3, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern100(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 180, colors[1]);
  const pattern2 = createRect(x, y, w / 2, h, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern101(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 90, 270, colors[1]);
  const pattern2 = createRect(x, y, w, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern102(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 180, 360, colors[1]);
  const pattern2 = createRect(x + w / 2, y, w / 2, h, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern103(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 270, 90, colors[1]);
  const pattern2 = createRect(x, y + h / 2, w, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern104(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 45, 315, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern105(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 225, colors[1]);
  const pattern2 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 315, 360, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern106(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 135, colors[1]);
  const pattern2 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 225, 360, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern107(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 45, colors[1]);
  const pattern2 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 135, 360, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern108(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern109(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern110(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern111(x, y, w, h, colors) {

  const points1 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern112(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern113(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern114(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern115(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern116(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern117(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern118(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern119(x, y, w, h, colors) {

  const points1 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern120(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern121(x, y, w, h, colors) {

  const points1 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();
  const points2 = x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern122(x, y, w, h, colors) {

  const points1 = (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();
  const points2 = x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern123(x, y, w, h, colors) {

  const points1 = (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();
  const points2 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern124(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();
  const points2 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + x.ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern125(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts() + ' ' + x.ts() + ',' + (y + h).ts();
  const points2 = (x + w / 2).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern126(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts();
  const points2 = (x + w / 2).ts() + ',' + (y + w / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern127(x, y, w, h, colors) {

  const points1 = (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();
  const points2 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern128(x, y, w, h, colors) {

  const points1 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();
  const points2 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern129(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();
  const points2 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern130(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + x.ts() + ',' + (y + h).ts();
  const points2 = x.ts() + ',' + (y + h).ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern131(x, y, w, h, colors) {

  const points1 = (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();
  const points2 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern132(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();
  const points2 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern133(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts();
  const points2 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern134(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + x.ts() + ',' + (y + h / 2).ts();
  const points2 = x.ts() + ',' + (y + h).ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern135(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 45, 135, colors[1]);
  const pattern2 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 225, 315, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern136(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 135, 225, colors[1]);
  const pattern2 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 315, 360, colors[1]);
  const pattern3 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 45, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern137(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createRect(x + w / 4, y + h / 4, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern138(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createRect(x, y, w / 2, h / 2, colors[1]);
  const pattern2 = createRect(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern139(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createRect(x + w / 2, y, w / 2, h / 2, colors[1]);
  const pattern2 = createRect(x, y + h / 2, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern140(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createRect(x, y + h / 4, w, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern141(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createRect(x + w / 4, y, w / 2, h, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern142(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createRect(x + w / 4, y, w / 2, h, colors[1]);
  const pattern2 = createRect(x, y + h / 4, w, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern143(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createRect(x, y, w, h / 4, colors[1]);
  const pattern2 = createRect(x, y + h / 2 + h / 4, w, h / 4, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern144(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createRect(x, y, w / 4, h, colors[1]);
  const pattern2 = createRect(x + w / 2 + w / 4, y, w / 4, h, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern145(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createRect(x, y, w / 4, h, colors[1]);
  const pattern2 = createRect(x + w / 2 + w / 4, y, w / 4, h, colors[1]);
  const pattern3 = createRect(x, y, w, h / 4, colors[1]);
  const pattern4 = createRect(x, y + h / 2 + h / 4, w, h / 4, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);
  canvas.appendChild(pattern4);

}

function drawPattern146(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 180, colors[1]);
  const pattern2 = createRect(x, y + h / 2, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern147(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 180, colors[1]);
  const pattern2 = createRect(x, y, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern148(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 90, 270, colors[1]);
  const pattern2 = createRect(x, y, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern149(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 90, 270, colors[1]);
  const pattern2 = createRect(x + w / 2, y, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern150(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 180, 360, colors[1]);
  const pattern2 = createRect(x + w / 2, y, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern151(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 180, 360, colors[1]);
  const pattern2 = createRect(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern152(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 270, 90, colors[1]);
  const pattern2 = createRect(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern153(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 270, 90, colors[1]);
  const pattern2 = createRect(x, y + h / 2, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern154(x, y, w, h, colors) {

  const points3 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 180, colors[1]);
  const pattern2 = createRect(x, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern3 = createPolygon(points3, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern155(x, y, w, h, colors) {

  const points3 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 180, colors[1]);
  const pattern2 = createRect(x, y, w / 2, h / 2, colors[1]);
  const pattern3 = createPolygon(points3, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern156(x, y, w, h, colors) {

  const points3 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 90, 270, colors[1]);
  const pattern2 = createRect(x, y, w / 2, h / 2, colors[1]);
  const pattern3 = createPolygon(points3, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern157(x, y, w, h, colors) {

  const points3 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 90, 270, colors[1]);
  const pattern2 = createRect(x + w / 2, y, w / 2, h / 2, colors[1]);
  const pattern3 = createPolygon(points3, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern158(x, y, w, h, colors) {

  const points3 = (x + w / 2).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 180, 360, colors[1]);
  const pattern2 = createRect(x + w / 2, y, w / 2, h / 2, colors[1]);
  const pattern3 = createPolygon(points3, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern159(x, y, w, h, colors) {

  const points3 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 180, 360, colors[1]);
  const pattern2 = createRect(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern3 = createPolygon(points3, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern160(x, y, w, h, colors) {

  const points3 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 270, 90, colors[1]);
  const pattern2 = createRect(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern3 = createPolygon(points3, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern161(x, y, w, h, colors) {

  const points3 = (x + w / 2).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 270, 90, colors[1]);
  const pattern2 = createRect(x, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern3 = createPolygon(points3, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern162(x, y, w, h, colors) {

  const points2 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 180, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern163(x, y, w, h, colors) {

  const points2 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 90, 270, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern164(x, y, w, h, colors) {

  const points2 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 180, 360, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern165(x, y, w, h, colors) {

  const points2 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 270, 90, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern166(x, y, w, h, colors) {

  const points3 = (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();
  const points4 = (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern3 = createPolygon(points3, colors[1]);
  const pattern4 = createPolygon(points4, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern3);
  canvas.appendChild(pattern4);

}

function drawPattern167(x, y, w, h, colors) {

  const points4 = (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h / 2).ts();
  const points5 = x.ts() + ',' + (y + h / 2).ts() + ' ' + x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + y.ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern4 = createPolygon(points4, colors[1]);
  const pattern5 = createPolygon(points5, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern4);
  canvas.appendChild(pattern5);

}

function drawPattern168(x, y, w, h, colors) {

  const points2 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts();
  const points5 = x.ts() + ',' + (y + h / 2).ts() + ' ' + x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + y.ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern2 = createPolygon(points2, colors[1]);
  const pattern5 = createPolygon(points5, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern5);

}

function drawPattern169(x, y, w, h, colors) {

  const points2 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts();
  const points3 = (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern2 = createPolygon(points2, colors[1]);
  const pattern3 = createPolygon(points3, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern170(x, y, w, h, colors) {

  const points2 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts();
  const points3 = (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();
  const points4 = (x + w / 2).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h / 2).ts();
  const points5 = x.ts() + ',' + (y + h / 2).ts() + ' ' + x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + y.ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern2 = createPolygon(points2, colors[1]);
  const pattern3 = createPolygon(points3, colors[1]);
  const pattern4 = createPolygon(points4, colors[1]);
  const pattern5 = createPolygon(points5, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);
  canvas.appendChild(pattern4);
  canvas.appendChild(pattern5);

}

function drawPattern171(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 90, colors[1]);
  const pattern2 = createRect(x, y, w / 2, h / 2, colors[1]);
  const pattern3 = createRect(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern4 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 180, 270, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);
  canvas.appendChild(pattern4);

}

function drawPattern172(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 90, 180, colors[1]);
  const pattern2 = createRect(x, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern3 = createRect(x + w / 2, y, w / 2, h / 2, colors[1]);
  const pattern4 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 270, 360, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);
  canvas.appendChild(pattern4);

}

function drawPattern173(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 180, 270, colors[1]);
  const pattern2 = createRect(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern3 = createRect(x, y, w / 2, h / 2, colors[1]);
  const pattern4 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 0, 90, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);
  canvas.appendChild(pattern4);

}

function drawPattern174(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 270, 360, colors[1]);
  const pattern2 = createRect(x + w / 2, y, w / 2, h / 2, colors[1]);
  const pattern3 = createRect(x, y + w / 2, w / 2, h / 2, colors[1]);
  const pattern4 = createCircleAdvanced(x + w / 2, y + w / 2, w / 2, 90, 180, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);
  canvas.appendChild(pattern4);

}

function drawPattern175(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + (y + h).ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern176(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern177(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern178(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern179(x, y, w, h, colors) {

  const points2 = (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createRect(x, y, w / 2, h, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern180(x, y, w, h, colors) {

  const points2 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createRect(x + w / 2, y, w / 2, h, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern181(x, y, w, h, colors) {

  const points2 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createRect(x, y, w, h / 2, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern182(x, y, w, h, colors) {

  const points2 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w / 2).ts() + ',' + y.ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createRect(x, y + h / 2, w, h / 2, colors[1]);
  const pattern2 = createPolygon(points2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern183(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + (y + h).ts() + ' ' + (x + w / 2).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();
  const points2 = x.ts() + ',' + (y + h).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[0]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern184(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h / 2).ts() + ' ' + x.ts() + ',' + (y + h).ts();
  const points2 = x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[0]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern185(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h).ts();
  const points2 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[0]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern186(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();
  const points2 = (x + w / 2).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createPolygon(points2, colors[0]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern187(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern188(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern189(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern190(x, y, w, h, colors) {

  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w / 2).ts() + ',' + (y + h / 2).ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);

}

function drawPattern191(x, y, w, h, colors) {

  const points0 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + x.ts() + ',' + (y + h).ts();
  const points1 = (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createPolygon(points0, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createRect(x, y, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern192(x, y, w, h, colors) {

  const points0 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + x.ts() + ',' + (y + h).ts();
  const points1 = (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();

  const pattern0 = createPolygon(points0, colors[1]);
  const pattern1 = createPolygon(points1, colors[0]);
  const pattern2 = createRect(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern193(x, y, w, h, colors) {

  const points0 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();
  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();

  const pattern0 = createPolygon(points0, colors[0]);
  const pattern1 = createPolygon(points1, colors[1]);
  const pattern2 = createRect(x, y + h / 2, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern194(x, y, w, h, colors) {

  const points0 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts() + ' ' + x.ts() + ',' + (y + h).ts();
  const points1 = x.ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + y.ts() + ' ' + (x + w).ts() + ',' + (y + h).ts();

  const pattern0 = createPolygon(points0, colors[1]);
  const pattern1 = createPolygon(points1, colors[0]);
  const pattern2 = createRect(x + w / 2, y, w / 2, h / 2, colors[1]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern195(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createEllipse(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern2 = createEllipse(x + w / 2, y + h / 2, w / 4, h / 4, colors[0]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);

}

function drawPattern196(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createEllipse(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern2 = createEllipse(x + w / 2, y + h / 2, w / 4, h / 4, colors[0]);
  const pattern3 = createRect(x, y + h / 2, w / 2, h / 2, colors[0]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern197(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createEllipse(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern2 = createEllipse(x + w / 2, y + h / 2, w / 4, h / 4, colors[0]);
  const pattern3 = createRect(x, y, w / 2, h / 2, colors[0]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern198(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createEllipse(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern2 = createEllipse(x + w / 2, y + h / 2, w / 4, h / 4, colors[0]);
  const pattern3 = createRect(x + w / 2, y, w / 2, h / 2, colors[0]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern199(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createEllipse(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern2 = createEllipse(x + w / 2, y + h / 2, w / 4, h / 4, colors[0]);
  const pattern3 = createRect(x + w / 2, y + h / 2, w / 2, h / 2, colors[0]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern200(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createEllipse(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern2 = createEllipse(x + w / 2, y + h / 2, w / 4, h / 4, colors[0]);
  const pattern3 = createRect(x, y + h / 4, w / 2, h / 2, colors[0]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern201(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createEllipse(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern2 = createEllipse(x + w / 2, y + h / 2, w / 4, h / 4, colors[0]);
  const pattern3 = createRect(x + w / 4, y, w / 2, h / 2, colors[0]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern202(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createEllipse(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern2 = createEllipse(x + w / 2, y + h / 2, w / 4, h / 4, colors[0]);
  const pattern3 = createRect(x + w / 2, y + h / 4, w / 2, h / 2, colors[0]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

function drawPattern203(x, y, w, h, colors) {

  const pattern0 = createRect(x, y, w, h, colors[0]);
  const pattern1 = createEllipse(x + w / 2, y + h / 2, w / 2, h / 2, colors[1]);
  const pattern2 = createEllipse(x + w / 2, y + h / 2, w / 4, h / 4, colors[0]);
  const pattern3 = createRect(x + w / 4, y + h / 2, w / 2, h / 2, colors[0]);

  canvas.appendChild(pattern0);
  canvas.appendChild(pattern1);
  canvas.appendChild(pattern2);
  canvas.appendChild(pattern3);

}

const patterns = [

drawPattern001, drawPattern002, drawPattern003, drawPattern004, drawPattern005, drawPattern006, drawPattern007, drawPattern008, drawPattern009, drawPattern010,
drawPattern011, drawPattern012, drawPattern013, drawPattern014, drawPattern015, drawPattern016, drawPattern017, drawPattern018, drawPattern019, drawPattern020,
drawPattern021, drawPattern022, drawPattern023, drawPattern024, drawPattern025, drawPattern026, drawPattern027, drawPattern028, drawPattern029, drawPattern030,
drawPattern031, drawPattern032, drawPattern033, drawPattern034, drawPattern035, drawPattern036, drawPattern037, drawPattern038, drawPattern039, drawPattern040,
drawPattern041, drawPattern042, drawPattern043, drawPattern044, drawPattern045, drawPattern046, drawPattern047, drawPattern048, drawPattern049, drawPattern050,
drawPattern051, drawPattern052, drawPattern053, drawPattern054, drawPattern055, drawPattern056, drawPattern057, drawPattern058, drawPattern059, drawPattern060,
drawPattern061, drawPattern062, drawPattern063, drawPattern064, drawPattern065, drawPattern066, drawPattern067, drawPattern068, drawPattern069, drawPattern070,
drawPattern071, drawPattern072, drawPattern073, drawPattern074, drawPattern075, drawPattern076, drawPattern077, drawPattern078, drawPattern079, drawPattern080,
drawPattern081, drawPattern082, drawPattern083, drawPattern084, drawPattern085, drawPattern086, drawPattern087, drawPattern088, drawPattern089, drawPattern090,
drawPattern091, drawPattern092, drawPattern093, drawPattern094, drawPattern095, drawPattern096, drawPattern097, drawPattern098, drawPattern099, drawPattern100,
drawPattern101, drawPattern102, drawPattern103, drawPattern104, drawPattern105, drawPattern106, drawPattern107, drawPattern108, drawPattern109, drawPattern110,
drawPattern111, drawPattern112, drawPattern113, drawPattern114, drawPattern115, drawPattern116, drawPattern117, drawPattern118, drawPattern119, drawPattern120,
drawPattern121, drawPattern122, drawPattern123, drawPattern124, drawPattern125, drawPattern126, drawPattern127, drawPattern128, drawPattern129, drawPattern130,
drawPattern131, drawPattern132, drawPattern133, drawPattern134, drawPattern135, drawPattern136, drawPattern137, drawPattern138, drawPattern139, drawPattern140,
drawPattern141, drawPattern142, drawPattern143, drawPattern144, drawPattern145, drawPattern146, drawPattern147, drawPattern148, drawPattern149, drawPattern150,
drawPattern151, drawPattern152, drawPattern153, drawPattern154, drawPattern155, drawPattern156, drawPattern157, drawPattern158, drawPattern159, drawPattern160,
drawPattern161, drawPattern162, drawPattern163, drawPattern164, drawPattern165, drawPattern166, drawPattern167, drawPattern168, drawPattern169, drawPattern170,
drawPattern171, drawPattern172, drawPattern173, drawPattern174, drawPattern175, drawPattern176, drawPattern177, drawPattern178, drawPattern179, drawPattern180,
drawPattern181, drawPattern182, drawPattern183, drawPattern184, drawPattern185, drawPattern186, drawPattern187, drawPattern188, drawPattern189, drawPattern190,
drawPattern191, drawPattern192, drawPattern193, drawPattern194, drawPattern195, drawPattern196, drawPattern197, drawPattern198, drawPattern199, drawPattern200,
drawPattern201, drawPattern202, drawPattern203];



//---

function polarToCartesian(cx, cy, radius, angleInDegrees) {

  const angleInRadians = (angleInDegrees - 90) * MATHPI_180;

  return {

    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians) };



}

//---

function createCanvas(width, height, containerId) {

  const canvas = document.createElementNS(SVG_NAMESPACE_URI, 'svg');

  canvas.setAttribute('width', width);
  canvas.setAttribute('height', height);
  canvas.setAttribute('shape-rendering', SHAPE_RENDERING);

  document.getElementById(containerId).appendChild(canvas);

  return canvas;

}

function createRect(x, y, width, height, color, rx = 0, ry = 0, stroke = false, strokeColor = LINE_COLOR, strokeWidth = LINE_WIDTH, strokeLinecap = LINE_CAP) {

  const rect = document.createElementNS(SVG_NAMESPACE_URI, 'rect');

  rect.setAttributeNS(null, 'x', x);
  rect.setAttributeNS(null, 'y', y);
  rect.setAttributeNS(null, 'rx', rx);
  rect.setAttributeNS(null, 'ry', ry);
  rect.setAttributeNS(null, 'width', width);
  rect.setAttributeNS(null, 'height', height);
  rect.setAttributeNS(null, 'fill', color);

  if (stroke === true) {

    rect.setAttributeNS(null, 'stroke', strokeColor);
    rect.setAttributeNS(null, 'stroke-width', strokeWidth);
    rect.setAttributeNS(null, 'stroke-linecap', strokeLinecap);

  }

  return rect;

}

function createCircle(cx, cy, radius, color, stroke = false, strokeColor = LINE_COLOR, strokeWidth = LINE_WIDTH, strokeLinecap = LINE_CAP) {

  const circle = document.createElementNS(SVG_NAMESPACE_URI, 'circle');

  circle.setAttributeNS(null, 'cx', cx);
  circle.setAttributeNS(null, 'cy', cy);
  circle.setAttributeNS(null, 'r', radius);
  circle.setAttributeNS(null, 'fill', color);

  if (stroke === true) {

    circle.setAttributeNS(null, 'stroke', strokeColor);
    circle.setAttributeNS(null, 'stroke-width', strokeWidth);
    circle.setAttributeNS(null, 'stroke-linecap', strokeLinecap);

  }

  return circle;

}

//https://jsbin.com/quhujowota/1/edit?html,js,output
function createCircleAdvanced(cx, cy, radius, startAngle, endAngle, color, stroke = false, strokeColor = LINE_COLOR, strokeWidth = LINE_WIDTH, strokeLinecap = LINE_CAP) {

  const path = createPath(color, stroke, strokeColor, strokeWidth, strokeLinecap);

  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  const d = [
  'M', cx, cy,
  'L', start.x, start.y,
  'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  'L', cx, cy].
  join(' ');

  path.setAttributeNS(null, 'd', d);

  return path;

}

function createEllipse(cx, cy, radiusX, radiusY, color, stroke = false, strokeColor = LINE_COLOR, strokeWidth = LINE_WIDTH, strokeLinecap = LINE_CAP) {

  const ellipse = document.createElementNS(SVG_NAMESPACE_URI, 'ellipse');

  ellipse.setAttributeNS(null, 'cx', cx);
  ellipse.setAttributeNS(null, 'cy', cy);
  ellipse.setAttributeNS(null, 'rx', radiusX);
  ellipse.setAttributeNS(null, 'ry', radiusY);
  ellipse.setAttributeNS(null, 'fill', color);

  if (stroke === true) {

    ellipse.setAttributeNS(null, 'stroke', strokeColor);
    ellipse.setAttributeNS(null, 'stroke-width', strokeWidth);
    ellipse.setAttributeNS(null, 'stroke-linecap', strokeLinecap);

  }

  return ellipse;

}

function createPolygon(points, color, stroke = false, strokeColor = LINE_COLOR, strokeWidth = LINE_WIDTH, strokeLinecap = LINE_CAP) {

  const polygon = document.createElementNS(SVG_NAMESPACE_URI, 'polygon');

  polygon.setAttributeNS(null, 'points', points);
  polygon.setAttributeNS(null, 'fill', color);

  if (stroke === true) {

    polygon.setAttributeNS(null, 'stroke', strokeColor);
    polygon.setAttributeNS(null, 'stroke-width', strokeWidth);
    polygon.setAttributeNS(null, 'stroke-linecap', strokeLinecap);

  }

  return polygon;

}

function createPath(color = 'transparent', stroke = false, strokeColor = LINE_COLOR, strokeWidth = LINE_WIDTH, strokeLinecap = LINE_CAP) {

  const path = document.createElementNS(SVG_NAMESPACE_URI, 'path');

  path.setAttributeNS(null, 'd', '');
  path.setAttributeNS(null, 'fill', color);

  if (stroke === true) {

    path.setAttributeNS(null, 'stroke', strokeColor);
    path.setAttributeNS(null, 'stroke-width', strokeWidth);
    path.setAttributeNS(null, 'stroke-linecap', strokeLinecap);

  }

  return path;

}

//---

function setPathAttribute(path, pathAttributes, command, position) {

  pathAttributes += command + ' ' + position.x + ' ' + position.y + ' ';
  path.setAttribute('d', pathAttributes);

  return pathAttributes;

}

function closePath(path, pathAttributes) {

  pathAttributes += 'Z';
  path.setAttribute('d', pathAttributes);

  return pathAttributes;

}

//---

init();
initGUI();

//---