import { ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-socket', // Имя селектора
  template: `<div [title]="title"></div>`, // Используем свойство title для title атрибута и применяем класс 'multiple' в зависимости от наличия multipleConnections
  styles: [`
    div {
      display: inline-block;
      color: black;
      background-color: black;
      cursor: pointer;
      border: 3px solid white;
      border-radius: 1em;
      width: 30px;
      height: 30px;
      vertical-align: middle;
      background: #ffffff66;
      margin: 0.1em 0.7em;
      z-index: 2;
      box-sizing: border-box;
    }
    div:hover {
      border-width: 4px;
    }
    .multiple {
      border-color: yellow;
    }
  `] // Стили компонента
})
export class SocketComponent implements OnChanges {
  @Input() data: any; // Входные данные
  @Input() rendered: any; // Рендер

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(): void {
    this.cdr.detectChanges(); // Обнаружение изменений
    requestAnimationFrame(() => this.rendered()); // Запуск рендера
  }

  // Геттер для получения заголовка
  get title(): any {
    return this.data.name; // Возвращает значение name из входных данных
  }
}
