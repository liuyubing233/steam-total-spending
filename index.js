// ==UserScript==
// @name                steam消费总额查看
// @name:en             steam total spending
// @namespace           http://tampermonkey.net/
// @version             1.0.0
// @description         一键查看steam消费总额
// @description:en      Used to view the total spending of steam consumption
// @author              super pufferFish
// @match               *://steamcommunity.com/*
// @match               *://store.steampowered.com/*
// @match               *://help.steampowered.com/*
// @require             https://code.jquery.com/jquery-3.1.1.min.js
// ==/UserScript==

(function () {
  'use strict'

  const ob = {
    hrefText: {
      'zh-CN': '消费记录',
      'default': 'Expenses record'
    },
    spending: {
      'zh-CN': '查看消费总额',
      'default': 'View total spending'
    },
    total: {
      'zh-CN': '总计消费：',
      'default': 'Total spending:'
    },
    buy: {
      'zh-CN': '购买：',
      'default': 'Buy:'
    },
    refund: {
      'zh-CN': '退款：',
      'default': 'Refund:'
    },
    choose: function (name) {
      const language = navigator.language || navigator.userLanguage
      return this[name][language] || this[name]['default']
    }
  }

  const globalActions = $('#global_actions')
  if (globalActions && globalActions[0]) {
    const toAccountHistory = $(`<a href="https://store.steampowered.com/account/history/" target="_self" style="vertical-align: top;margin-right: 12px;">${ob.choose('hrefText')}</a>`)
    globalActions.prepend(toAccountHistory)
  }

  if (/\/account\/history/.test(location.pathname)) {
    const accountManagement = $('.account_management .page_content')
    if (accountManagement && accountManagement[0]) {
      const totalSpending = $(`<a href="javascript:;" class="my-total-spending">${ob.choose('spending')}</a>`)
      totalSpending[0].onclick = onTotalSpending
      accountManagement.append(totalSpending)
    }
  }

  function onTotalSpending () {
    const haveLoadMore = document.getElementById('load_more_button')
    this.innerText = 'loading...'
    if (haveLoadMore && haveLoadMore.style.display !== 'none') {
      haveLoadMore.click()
      setTimeout(() => {
        onTotalSpending.call(this)
      }, 500)
      return
    }
    this.innerText = ob.choose('spending')
    const { all, less, add } = addSpending()
    window.alert(`${ob.choose('total')}${all}\n${ob.choose('buy')}${add}\n${ob.choose('refund')}${less}`)
  }

  function addSpending () {
    let numAll = 0
    let lessSpend = 0
    let addSpend = 0
    const evenWhtTotal = document.querySelectorAll('.wallet_table_row .wht_total')
    const dot = evenWhtTotal[0].innerText.replace(/\d+/, '').trim()
    const rep = new RegExp(dot)
    evenWhtTotal.forEach((item) => {
      let doll = Number(item.innerText.replace(rep, '').trim())
      if (doll) {
        if (item.className.indexOf('wht_refunded') >= 0) {
          numAll -= doll
          lessSpend += doll
        } else {
          numAll += doll
          addSpend += doll
        }
      }
    })
    return {
      all: dot + floorMath(numAll),
      less: dot + floorMath(lessSpend),
      add: dot + floorMath(addSpend),
    }
  }

  function floorMath (num) {
    return Math.floor(num * 100) / 100
  }
})()