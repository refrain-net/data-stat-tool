'use strict';
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const lbSheetName= document.getElementById('lb_sheet-name');
const cbShowHistogram = document.getElementById('cb_show-histogram');
const cbShowNorm = document.getElementById('cb_show-norm');
const cbShowBoxplot = document.getElementById('cb_show-boxplot');
const cbShowOutrangeCount = document.getElementById('cb_show-outrange-count');

const tbLowerStdLim = document.getElementById('tb_lower-std-lim');
const tbUpperStdLim = document.getElementById('tb_upper-std-lim');

const status = {
  show_histogram: true, show_norm: true, show_boxplot: true,
  grouping_step: 1, graph_label_height: 64, graph_line_width: 2,
  graph_font_size: 32,
  lsl: 0, usl: 0, graph_lower: 0, graph_upper: 0
};
const data = [{v: 0}, {v: 0}, {v: 0}, {v: 1}, {v: 1}, {v: 1}, {v: 1}, {v: 2}, {v: 3}, {v: 3}, {v: 3}, {v: 5}, {v: 5}, {v: 10}]; // cells

cbShowHistogram.addEventListener('change', onChange, false);
cbShowNorm.addEventListener('change', onChange, false);
cbShowBoxplot.addEventListener('change', onChange, false);
tbLowerStdLim.addEventListener('change', onChange, false);
tbUpperStdLim.addEventListener('change', onChange, false);

function canvas_draw_line (ctx, sx, sy, ex, ey) {
  ctx.beginPath();
  ctx.moveTo(sx, ctx.canvas.height - sy);
  ctx.lineTo(ex, ctx.canvas.height - ey);
  ctx.stroke();
}
function canvas_draw_square (ctx, x, y, w, h) {
  ctx.fillRect(x, ctx.canvas.height - y - h, w, h);
}

update();

function reset() {
  canvas.width = canvas.width;
  // 一旦並べ替え
  const sorted = data.sort((a, b) => a.v - b.v);
  const min = sorted[0].v;
  const max = sorted.at(-1).v;
  // 上下限値はフォームから持って来る
  status.lsl = parseFloat(tbLowerStdLim.value) || min;
  status.usl = parseFloat(tbUpperStdLim.value) || max;
  const {grouping_step} = status;
  // グラフの下限は上下限とデータの最大・最小の外側の方
  status.graph_lower = Math.min(status.lsl, min - min % grouping_step);
  status.graph_upper = Math.max(status.usl, max - max % grouping_step);
  status.histogram_count = status.graph_upper - status.graph_lower + 1;
}

function grouping_data () {
  const {grouping_step} = status;
  const ret = {};
  let i;
  for (const {v} of data) {
    i = (v - v % grouping_step) / grouping_step;
    ret[i] ||= 0;
    ret[i] ++;
  }
  return ret;
}

function drawHistogram() {
  const data = grouping_data();
  let max_count = 1;
  for (const key of Object.keys(data)) {
    max_count = Math.max(max_count, data[key]);
  }
  const {height, width} = canvas;
  const {graph_label_height, histogram_count, graph_lower, graph_upper} = status;
  const h = (height - graph_label_height) / max_count;
  const w = width / histogram_count;
  let xi;
  for (let i = graph_lower; i <= graph_upper; i ++) {
    xi = data[i];
    canvas_draw_square(ctx, (i - graph_lower) * w + w * 0.1, graph_label_height, w * 0.8, xi * h);
  }
}

function drawBoxplot () {}



function drawAxis () {
  const {height, width} = canvas;
  const {graph_font_size, grouping_step, graph_line_width,
    graph_label_height, histogram_count, graph_lower, graph_upper
  } = status;
  ctx.lineWidth = graph_line_width;
  ctx.font = `${graph_font_size}px serif`;
  ctx.textAlign = 'center';
  ctx.strokeStyle = 'black';
  let sx = 0, sy = graph_label_height, ex = width, ey = graph_label_height, text, tx, ty;
  canvas_draw_line(ctx, sx, sy, ex, ey);
  const w = width / histogram_count;
  for (let i = graph_lower; i <= graph_upper; i ++) {
    sx = i * w - w * graph_lower;
    sy = 0;
    ex = i * w - w * graph_lower;
    ey = graph_label_height;
    canvas_draw_line(ctx, sx, sy, ex, ey);
    text = i * grouping_step;
    tx = i * w + w / 2 - w * graph_lower;
    ty = height - graph_label_height + graph_font_size;
    ctx.fillText(text, tx, ty);
  }
  // 右端描くために+1回
  canvas_draw_line(ctx, width, 0, width, graph_label_height);
}

function update () {
  reset();
  if (status.show_histogram) drawHistogram();
  if (status.show_norm) {}
  if (status.show_boxplot) drawBoxplot();
  // drawOutrange();
  // drawInformations();
  drawAxis();
}
function onChange (event) {
  switch (this) {
    case cbShowHistogram:
      status.show_histogram = this.checked;
      update();
      break;
    case cbShowNorm:
      status.show_norm = this.checked;
      update();
      break;
    case cbShowBoxplot:
      status.show_boxplot = this.checked;
      update();
      break;
    case cbShowOutrangeCount:
      update();
      break;
    case tbLowerStdLim:
      status.lsl = parseFloat(this.value);
      update();
      break;
    case tbUpperStdLim:
      status.usl = parseFloat(this.value);
      update();
      break;
  }
}
