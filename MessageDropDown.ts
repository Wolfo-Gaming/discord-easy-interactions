import { GuildButtonEmoji, MessageComponent } from "discord-buttons";
import { listeners } from "./index";

interface MessageDropDownOption {
  description?: string;
  label: string;
  emoji?: string | GuildButtonEmoji;
  value: string;
  onSelect?: (data: MessageComponent, dropdown: MessageDropDown) => void;
}

interface MessageDropDownConstructor {
  placeholder?: string;
  options?: MessageDropDownOption[];
  minValues?: number;
  maxValues?: number;
  onUpdate?: (data: MessageComponent, dropdown: MessageDropDown) => void;
  id?: string;
}

export default class MessageDropDown {
  public type: number = 3;
  public placeholder: string;
  public min_values: number = 1;
  public max_values: number = 1;
  public custom_id: string;
  public options: MessageDropDownOption[] = [];
  #onUpdate: (data: MessageComponent, dropdown: MessageDropDown) => any;
  #menuListener: (data: MessageComponent) => any;
  #disposed = false;

  constructor(data: MessageDropDownConstructor) {
    this.placeholder = data.placeholder ?? "Make a selection"
    this.min_values = data.minValues ?? 0;
    this.max_values = data.maxValues ?? 1;
    this.options = data.options ?? []

    let id = data.id || `ei:dd:${Math.round((Math.random() * 281474976710655)).toString(36)}`;
    this.custom_id = id;
    this.#onUpdate = data.onUpdate;

    this.#menuListener = (data) => {
      if (data.id != id) return;
      if (typeof this.#onUpdate == "function") this.#onUpdate(data, this);
      data.values?.forEach(value => {
        let item = this.options.find(i => i.value == value);
        if (typeof item.onSelect == "function") item.onSelect(data, this);
      });
    };
    listeners.clickMenu.add(this.#menuListener);
  }

  get disposed() {
    return this.#disposed;
  }

  dispose() {
    if (this.#disposed) return false;
    listeners.clickMenu.delete(this.#menuListener);
    this.#disposed = true;
    return true;
  }
}