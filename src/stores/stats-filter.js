import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';

// format period date input to match YYYY-MM-DD
const formatDateInput = (s) => {
  // complete year
  if (s.length == 6) {
    s = String((new Date()).getFullYear()).slice(0, 2) + s;
  }
  // insert dashes
  if (!s.includes("-")) {
    s = s.slice(0, 4) + "-" + s.slice(4, 6) + "-" + s.slice(6);
  }
  // shorten to 10 characters
  s = s.slice(0, 10);
  // set lower limit
  if (!isNaN(Date.parse(s)) && Date.parse(s) < 0) {
    s = "1970-01-01";
  }
  // set upper limit
  if (!isNaN(Date.parse(s)) && Date.parse(s) > Date.now()) {
    s = (new Date()).toISOString().slice(0, 10);
  }
  return s;
};

const initialStatsFilter = {
  account:   null,
  folder:    null,
  contact:   null,
  startDate: null,
  endDate:   null,
};

export const useStatsFilterStore = defineStore('stats-filter', {
  state: () => ({
    data: useLocalStorage('thirdstats/stats-filter', initialStatsFilter),
  }),
  getters: {
    account() {
      return this.data.account;
    },
    folder() {
      return this.data.folder;
    },
    contact() {
      return this.data.contact;
    },
    start() {
      return this.data.startDate;
    },
    end() {
      return this.data.endDate;
    },
    singleAccount() {
      return this.data.account !== 'sum';
    },
    isActive() {
      return this.data.folder || this.data.contact || this.data.startDate || this.data.endDate;
    },
  },
  actions: {
    selectAccount(account) {
      this.data.account = account;
    },
    reset() {
      this.$patch({ data: initialStatsFilter });
    },
    resetFolder() {
      this.data.folder = null;
    },
    resetContact() {
      this.data.contact = null;
    },
    resetDateRange() {
      this.data.startDate = null;
      this.data.endDate = null;
    },
    formatStart() {
      if (this.data.startDate) {
        this.data.startDate = formatDateInput(this.data.startDate);
      }
    },
    formatEnd() {
      if (this.data.endDate) {
        this.data.endDate = formatDateInput(this.data.endDate);
      }
    },
  },
});
