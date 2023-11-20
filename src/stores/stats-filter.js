import { computed } from 'vue';
import { defineStore, patc } from 'pinia';
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

export const useStatsFilterStore = defineStore('stats-filter', () => {
  const filter = useLocalStorage('thirdstats/stats-filter', initialStatsFilter);
  const isSingleAccount = computed(() => filter.account !== 'sum' );
  const isActiveFilter = computed(() => {
    return filter.folder || filter.contact || filter.startDate || filter.endDate;
  });
  function selectAccount (account) {
    filter.account = account;
  };
  function resetFolder () {
    filter.folder = null;
  };
  function resetContact () {
    filter.contact = null;
  };
  function resetDateRange () {
    filter.startDate = null;
    filter.endDate = null;
  };
  function resetFilter () {
    resetFolder();
    resetContact();
    resetDateRange();
  };
  function formatStart () {
    if (filter.startDate) {
      filter.startDate = formatDateInput(filter.startDate);
    }
  };
  function formatEnd () {
    if (filter.endDate) {
      filter.endDate = formatDateInput(filter.endDate);
    }
  };

  return {
    filter,
    isSingleAccount,
    isActiveFilter,
    selectAccount,
    resetFilter,
    resetFolder,
    resetContact,
    resetDateRange,
    formatStart,
    formatEnd,
  };
});
