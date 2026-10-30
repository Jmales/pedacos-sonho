/**
 * Booking calculator — loads data/pricing.json and drives the reservas form.
 */
(function () {
  var pricing = null;
  var extrasById = {};

  function t(key, vars) {
    var text =
      window.pdsI18n && window.pdsI18n.t ? window.pdsI18n.t(key) : key;
    if (!vars) return text;
    return Object.keys(vars).reduce(function (out, k) {
      return out.replace(new RegExp('\\{' + k + '\\}', 'g'), String(vars[k]));
    }, text);
  }

  function lang() {
    return window.pdsI18n && window.pdsI18n.getLang
      ? window.pdsI18n.getLang()
      : 'pt';
  }

  function loc(obj) {
    if (!obj) return '';
    var l = lang();
    return obj[l] || obj.pt || obj.en || '';
  }

  function euro(n) {
    return (
      Number(n || 0).toLocaleString(lang() === 'en' ? 'en-GB' : 'pt-PT', {
        maximumFractionDigits: 0,
      }) + ' €'
    );
  }

  function getAccessKey(form) {
    var input = form.querySelector('input[name="access_key"]');
    return input && input.value ? input.value.trim() : '';
  }

  function isAccessKeyConfigured(key) {
    if (!key || key === 'YOUR_ACCESS_KEY_HERE') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      key
    );
  }

  function web3formsMessage(result) {
    if (!result) return '';
    if (typeof result.message === 'string') return result.message;
    if (result.body && typeof result.body.message === 'string') {
      return result.body.message;
    }
    return '';
  }

  function web3formsAccepted(result, accessKey) {
    if (!result || !result.success || !isAccessKeyConfigured(accessKey)) {
      return false;
    }
    var msg = web3formsMessage(result).toLowerCase();
    return (
      msg.indexOf('insert your actual') === -1 &&
      msg.indexOf('your_access_key') === -1
    );
  }

  function syncFormConfigWarning(form) {
    var el = document.getElementById('form_config_error');
    if (!el || !form) return;
    if (!isAccessKeyConfigured(getAccessKey(form))) {
      el.textContent = t('res_warn_access_key');
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  }

  /** Anonymous Gregorian algorithm → Easter Sunday (local noon). */
  function easterSunday(year) {
    var a = year % 19;
    var b = Math.floor(year / 100);
    var c = year % 100;
    var d = Math.floor(b / 4);
    var e = b % 4;
    var f = Math.floor((b + 8) / 25);
    var g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4);
    var k = c % 4;
    var l = (32 + 2 * e + 2 * i - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    var month = Math.floor((h + l - 7 * m + 114) / 31);
    var day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day, 12, 0, 0);
  }

  function ymd(d) {
    return (
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0')
    );
  }

  function addDays(date, days) {
    var d = new Date(date.getTime());
    d.setDate(d.getDate() + days);
    return d;
  }

  /** Portuguese national holidays (fixed + Easter-based). Extra dates from pricing.json. */
  function portugueseHolidays(year) {
    var fixed = [
      year + '-01-01', // Ano Novo
      year + '-04-25', // Dia da Liberdade
      year + '-05-01', // Dia do Trabalhador
      year + '-06-10', // Dia de Portugal
      year + '-08-15', // Assunção de Nossa Senhora
      year + '-10-05', // Implantação da República
      year + '-11-01', // Todos os Santos
      year + '-12-01', // Restauração da Independência
      year + '-12-08', // Imaculada Conceição
      year + '-12-25', // Natal
    ];
    var easter = easterSunday(year);
    var movable = [
      ymd(addDays(easter, -2)), // Sexta-feira Santa
      ymd(easter), // Páscoa
      ymd(addDays(easter, 60)), // Corpo de Deus
    ];
    var extra = (pricing && pricing.extraHolidayDates) || [];
    var set = {};
    fixed.concat(movable).concat(extra).forEach(function (iso) {
      if (iso) set[iso] = true;
    });
    return set;
  }

  function isHoliday(dateStr) {
    if (!dateStr) return false;
    var year = parseInt(dateStr.slice(0, 4), 10);
    if (isNaN(year)) return false;
    return !!portugueseHolidays(year)[dateStr];
  }

  /** Weekend OR Portuguese holiday → weekend rate. */
  function isWeekendRate(dateStr) {
    if (!dateStr) return false;
    var d = new Date(dateStr + 'T12:00:00');
    var day = d.getDay();
    if (day === 0 || day === 6) return true;
    return isHoliday(dateStr);
  }

  function getEventType(id) {
    if (!pricing || !id) return null;
    return pricing.eventTypes.find(function (e) {
      return e.id === id;
    });
  }

  function isQuoteExtra(extra) {
    return !!(extra && (extra.quoteOnly || extra.pendingPrice || extra.unitPrice == null));
  }

  function unitLabel(unit) {
    var map = {
      child: 'res_unit_child',
      hour: 'res_unit_hour',
      event: 'res_unit_event',
      guest: 'res_unit_guest',
    };
    return t(map[unit] || 'res_unit_event');
  }

  function formatRateLine(extra) {
    if (isQuoteExtra(extra)) {
      return extra.pendingPrice ? t('res_pending_price') : t('res_quote_only');
    }
    return euro(extra.unitPrice) + ' ' + unitLabel(extra.unit);
  }

  function fillEventTypes() {
    var select = document.getElementById('tipo_evento');
    if (!select || !pricing) return;
    var current = select.value;
    select.innerHTML = '';
    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.disabled = true;
    placeholder.selected = !current;
    placeholder.textContent = t('res_opt_select');
    select.appendChild(placeholder);
    pricing.eventTypes.forEach(function (et) {
      var opt = document.createElement('option');
      opt.value = et.id;
      opt.textContent = loc(et.label);
      select.appendChild(opt);
    });
    if (current && pricing.eventTypes.some(function (e) { return e.id === current; })) {
      select.value = current;
    }
  }

  function syncGuestFields() {
    var et = getEventType(document.getElementById('tipo_evento').value);
    var split = document.getElementById('guests_split');
    var unified = document.getElementById('guests_unified');
    var under3 = document.getElementById('guests_under3_wrap');
    var hint = document.getElementById('guests_hint');
    var adults = document.getElementById('num_adultos');
    var kids = document.getElementById('num_criancas');
    var people = document.getElementById('num_pessoas');
    if (!et) {
      if (split) split.classList.add('hidden');
      if (unified) unified.classList.add('hidden');
      if (under3) under3.classList.add('hidden');
      if (hint) hint.classList.add('hidden');
      return;
    }
    var isSplit = !!et.splitGuests;
    if (split) split.classList.toggle('hidden', !isSplit);
    if (unified) unified.classList.toggle('hidden', isSplit);
    if (under3) under3.classList.remove('hidden');
    if (hint) hint.classList.remove('hidden');
    if (adults) adults.disabled = !isSplit;
    if (kids) kids.disabled = !isSplit;
    if (people) people.disabled = isSplit;
    if (isSplit) {
      if (people) people.value = '';
    } else {
      if (adults) adults.value = '';
      if (kids) kids.value = '';
    }
  }

  function readGuests(et) {
    var under3 = Math.max(0, parseInt(document.getElementById('num_under3').value, 10) || 0);
    if (et && et.splitGuests) {
      var adults = Math.max(0, parseInt(document.getElementById('num_adultos').value, 10) || 0);
      var kids = Math.max(0, parseInt(document.getElementById('num_criancas').value, 10) || 0);
      return {
        split: true,
        adults: adults,
        kids: kids,
        under3: under3,
        countable: adults + kids,
        mealKids: kids,
      };
    }
    var people = Math.max(0, parseInt(document.getElementById('num_pessoas').value, 10) || 0);
    return {
      split: false,
      adults: 0,
      kids: 0,
      people: people,
      under3: under3,
      countable: people,
      mealKids: 0,
    };
  }

  function maxGuestsFor(et) {
    if (et && et.maxGuests != null) return et.maxGuests;
    return (pricing && pricing.maxGuestsDefault) || 80;
  }

  function renderExtras() {
    var wrap = document.getElementById('extras_list');
    var note = document.getElementById('extras_note');
    var et = getEventType(document.getElementById('tipo_evento').value);
    if (!wrap) return;

    wrap.innerHTML = '';
    if (!et || !et.extraIds || !et.extraIds.length) {
      wrap.innerHTML =
        '<p class="text-xs text-gray-400 py-2">' + t('res_extras_empty') + '</p>';
      if (note) {
        note.classList.add('hidden');
        note.textContent = '';
      }
      return;
    }

    if (note) {
      if (et.extrasTriggerQuote) {
        note.textContent = loc(et.extrasNote) || t('res_extras_quote_note');
        note.classList.remove('hidden');
      } else {
        note.classList.add('hidden');
      }
    }

    et.extraIds.forEach(function (id) {
      var extra = extrasById[id];
      if (!extra) return;
      var label = document.createElement('label');
      label.className =
        'flex items-start gap-3 p-3.5 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition';
      label.dataset.extraId = id;
      if (extra.exclusiveGroup) label.dataset.group = extra.exclusiveGroup;

      var check = document.createElement('input');
      check.type = 'checkbox';
      check.name = 'Extra_' + id;
      check.value = 'Sim';
      check.className = 'shrink-0 extra-check mt-0.5';
      check.dataset.extraId = id;

      var body = document.createElement('div');
      body.className = 'flex-grow min-w-0 text-xs md:text-sm';
      body.innerHTML =
        '<span class="block font-medium text-gray-800">' +
        loc(extra.label) +
        '</span>' +
        '<span class="block text-gray-400 text-xs mt-0.5">' +
        loc(extra.description) +
        '</span>' +
        '<span class="block text-secondary font-semibold text-xs mt-1">' +
        formatRateLine(extra) +
        '</span>';

      if (!isQuoteExtra(extra) && extra.unit === 'hour') {
        var qtyWrap = document.createElement('div');
        qtyWrap.className = 'mt-2 hidden extra-qty-wrap';
        qtyWrap.innerHTML =
          '<label class="block text-[11px] text-gray-500 mb-1">' +
          t('res_extra_hours_label') +
          '</label>' +
          '<input type="number" min="1" value="1" data-extra-qty="' +
          id +
          '" class="w-24 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm">';
        body.appendChild(qtyWrap);
      }

      if (!isQuoteExtra(extra) && (extra.unit === 'child' || extra.unit === 'guest')) {
        var qtyHint = document.createElement('p');
        qtyHint.className = 'mt-1 text-[11px] text-amber-700 hidden extra-qty-hint';
        qtyHint.dataset.hintUnit = extra.unit;
        qtyHint.textContent =
          extra.unit === 'child' ? t('res_need_kids') : t('res_need_guests');
        body.appendChild(qtyHint);
      }

      label.appendChild(check);
      label.appendChild(body);
      wrap.appendChild(label);

      check.addEventListener('change', function () {
        if (check.checked && extra.exclusiveGroup) {
          wrap.querySelectorAll('label[data-group="' + extra.exclusiveGroup + '"] input[type="checkbox"]').forEach(function (other) {
            if (other !== check) {
              other.checked = false;
              var oq = other.closest('label').querySelector('.extra-qty-wrap');
              if (oq) oq.classList.add('hidden');
            }
          });
        }
        var qty = label.querySelector('.extra-qty-wrap');
        if (qty) qty.classList.toggle('hidden', !check.checked);
        recalculate();
      });
    });
  }

  function selectedExtras() {
    var out = [];
    document.querySelectorAll('#extras_list input[type="checkbox"]:checked').forEach(function (cb) {
      var id = cb.dataset.extraId;
      var extra = extrasById[id];
      if (!extra) return;
      var qty = 1;
      if (!isQuoteExtra(extra) && extra.unit === 'hour') {
        var input = document.querySelector('[data-extra-qty="' + id + '"]');
        qty = Math.max(1, parseInt(input && input.value, 10) || 1);
      }
      out.push({ extra: extra, qty: qty });
    });
    return out;
  }

  function parseTimeToMinutes(value) {
    if (!value || value.indexOf(':') === -1) return null;
    var parts = value.split(':');
    var h = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  }

  function formatHours(n) {
    var rounded = Math.round(n * 100) / 100;
    if (Number.isInteger(rounded)) return String(rounded);
    return String(rounded).replace(/\.?0+$/, '').replace(/(\.\d)0$/, '$1');
  }

  function fillTimeSelects() {
    ['hora_inicio', 'hora_fim'].forEach(function (id) {
      var sel = document.getElementById(id);
      if (!sel) return;
      var current = sel.value;
      sel.innerHTML = '';
      var placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.disabled = true;
      placeholder.selected = !current;
      placeholder.textContent = t('res_opt_time');
      sel.appendChild(placeholder);
      for (var mins = 0; mins < 24 * 60; mins += 30) {
        var h = Math.floor(mins / 60);
        var m = mins % 60;
        var value =
          String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
        var opt = document.createElement('option');
        opt.value = value;
        opt.textContent = value;
        sel.appendChild(opt);
      }
      if (current) sel.value = current;
    });
  }

  function readDuration() {
    var startEl = document.getElementById('hora_inicio');
    var endEl = document.getElementById('hora_fim');
    var hoursInput = document.getElementById('horas_evento');
    var hint = document.getElementById('horas_hint');
    var minHours = (pricing && pricing.minHours) || 3;
    var start = startEl && startEl.value;
    var end = endEl && endEl.value;
    var startMin = parseTimeToMinutes(start);
    var endMin = parseTimeToMinutes(end);

    if (startMin == null || endMin == null) {
      if (hoursInput) hoursInput.value = '';
      if (hint) hint.textContent = t('res_hours_need_times');
      return null;
    }

    // Same start/end is ambiguous — ask for a real window
    if (endMin === startMin) {
      if (hoursInput) hoursInput.value = '';
      if (hint) {
        hint.textContent = t('res_hours_need_times');
        hint.classList.remove('text-amber-700');
        hint.classList.add('text-gray-400');
      }
      return null;
    }

    var nextDay = false;
    if (endMin < startMin) {
      endMin += 24 * 60;
      nextDay = true;
    }
    var hoursExact = (endMin - startMin) / 60;
    // Bill whole hours, rounding up partials (e.g. 3h15 → 4h)
    var billable = Math.max(1, Math.ceil(hoursExact - 1e-9));
    var belowMin = billable < minHours;

    if (hoursInput) hoursInput.value = String(billable);

    if (hint) {
      var vars = { hours: formatHours(hoursExact), min: minHours };
      if (belowMin) {
        hint.textContent = t('res_hours_below_min', vars);
        hint.classList.add('text-amber-700');
        hint.classList.remove('text-gray-400');
      } else {
        hint.textContent = t(nextDay ? 'res_hours_next_day' : 'res_hours_hint', vars);
        hint.classList.remove('text-amber-700');
        hint.classList.add('text-gray-400');
      }
    }

    return {
      start: start,
      end: end,
      hoursExact: hoursExact,
      hours: billable,
      nextDay: nextDay,
      belowMin: belowMin,
      minHours: minHours,
    };
  }

  function computeEstimate() {
    var et = getEventType(document.getElementById('tipo_evento').value);
    var date = document.getElementById('data_evento').value;
    var duration = readDuration();

    if (!et || !date || !duration) {
      return { ready: false };
    }

    if (duration.belowMin) {
      return {
        ready: false,
        belowMin: true,
        hoursExact: duration.hoursExact,
        minHours: duration.minHours,
      };
    }

    var guests = readGuests(et);
    var maxGuests = maxGuestsFor(et);
    var overCapacity = guests.countable > maxGuests;
    var hours = duration.hours;

    var weekend = isWeekendRate(date);
    var holiday = isHoliday(date);
    var rate = weekend ? et.hourlyWeekend : et.hourlyWeekday;
    var venue = hours * rate;
    var lines = [
      {
        id: 'venue',
        label: t('res_line_venue', { hours: hours, rate: rate }),
        amount: venue,
      },
    ];
    var extrasTotal = 0;
    var quoteExtras = [];
    var missingKids = false;
    var missingGuests = false;

    selectedExtras().forEach(function (item) {
      var extra = item.extra;
      if (isQuoteExtra(extra)) {
        quoteExtras.push(loc(extra.label));
        return;
      }
      var qty = 1;
      if (extra.unit === 'child') {
        if (!guests.mealKids) {
          missingKids = true;
          return;
        }
        qty = guests.mealKids;
      } else if (extra.unit === 'guest') {
        if (!guests.countable) {
          missingGuests = true;
          return;
        }
        qty = guests.countable;
      } else if (extra.unit === 'hour') {
        qty = item.qty;
      } else {
        qty = 1;
      }
      var amount = extra.unitPrice * qty;
      extrasTotal += amount;
      var detail =
        qty > 1
          ? loc(extra.label) + ' (' + qty + ' × ' + euro(extra.unitPrice) + ')'
          : loc(extra.label);
      lines.push({ id: extra.id, label: detail, amount: amount });
    });

    var needsQuote =
      overCapacity ||
      !!(et.extrasTriggerQuote && quoteExtras.length) ||
      (quoteExtras.length > 0 && lines.length === 1 && extrasTotal === 0);
    return {
      ready: true,
      et: et,
      weekend: weekend,
      holiday: holiday,
      hours: hours,
      hoursExact: duration.hoursExact,
      nextDay: duration.nextDay,
      start: duration.start,
      end: duration.end,
      rate: rate,
      venue: venue,
      extrasTotal: extrasTotal,
      total: venue + extrasTotal,
      deposit: et.deposit,
      lines: lines,
      quoteExtras: quoteExtras,
      needsQuote: needsQuote,
      overCapacity: overCapacity,
      maxGuests: maxGuests,
      missingKids: missingKids,
      missingGuests: missingGuests,
      guests: guests,
      date: date,
    };
  }

  function renderEstimate(est) {
    var box = document.getElementById('estimate_box');
    var linesEl = document.getElementById('estimate_lines');
    var totalEl = document.getElementById('estimate_total');
    var depositEl = document.getElementById('estimate_deposit');
    var quoteEl = document.getElementById('estimate_quote');
    var incompleteEl = document.getElementById('estimate_incomplete');
    var submitBtn = document.getElementById('btn_submit');
    var dayBadge = document.getElementById('day_badge');

    if (!box) return;

    document.querySelectorAll('.extra-qty-hint').forEach(function (el) {
      el.classList.add('hidden');
    });

    if (dayBadge) {
      var date = document.getElementById('data_evento').value;
      if (date) {
        if (isHoliday(date)) {
          dayBadge.textContent = t('res_day_holiday');
        } else if (isWeekendRate(date)) {
          dayBadge.textContent = t('res_day_weekend');
        } else {
          dayBadge.textContent = t('res_day_weekday');
        }
        dayBadge.classList.remove('hidden');
      } else {
        dayBadge.classList.add('hidden');
      }
    }

    if (!est || !est.ready) {
      if (incompleteEl) {
        incompleteEl.textContent = est && est.belowMin
          ? t('res_hours_below_min', {
              hours: formatHours(est.hoursExact),
              min: est.minHours,
            })
          : t('res_incomplete');
        incompleteEl.classList.remove('hidden');
      }
      if (linesEl) linesEl.innerHTML = '';
      if (totalEl) totalEl.textContent = '—';
      if (depositEl) depositEl.textContent = '';
      if (quoteEl) quoteEl.classList.add('hidden');
      if (submitBtn) submitBtn.innerHTML = t('res_submit');
      return;
    }

    if (incompleteEl) incompleteEl.classList.add('hidden');

    if (est.missingKids || est.missingGuests) {
      document.querySelectorAll('#extras_list input[type="checkbox"]:checked').forEach(function (cb) {
        var extra = extrasById[cb.dataset.extraId];
        if (!extra) return;
        var hint = cb.closest('label').querySelector('.extra-qty-hint');
        if (!hint) return;
        if (
          (est.missingKids && extra.unit === 'child') ||
          (est.missingGuests && extra.unit === 'guest')
        ) {
          hint.classList.remove('hidden');
        }
      });
    }

    if (est.needsQuote) {
      if (quoteEl) {
        if (est.overCapacity) {
          quoteEl.querySelector('[data-quote-title]').textContent = t(
            'res_over_capacity_title'
          );
          quoteEl.querySelector('[data-quote-body]').textContent = t(
            'res_over_capacity_body',
            { max: est.maxGuests }
          );
        } else {
          quoteEl.querySelector('[data-quote-title]').textContent = t(
            'res_quote_mode_title'
          );
          quoteEl.querySelector('[data-quote-body]').textContent = t(
            'res_quote_mode_body'
          );
        }
        quoteEl.classList.remove('hidden');
      }
      if (linesEl) {
        var quoteLines =
          '<div class="flex justify-between gap-3 text-sm py-1"><span class="text-gray-600">' +
          t('res_line_venue', { hours: est.hours, rate: est.rate }) +
          '</span><span class="font-medium">' +
          (est.overCapacity ? t('res_quote_only') : euro(est.venue)) +
          '</span></div>';
        quoteLines += est.quoteExtras
          .map(function (name) {
            return (
              '<div class="flex justify-between gap-3 text-sm py-1"><span class="text-gray-600">' +
              name +
              '</span><span class="text-secondary text-xs font-semibold">' +
              t('res_quote_only') +
              '</span></div>'
            );
          })
          .join('');
        if (est.overCapacity) {
          quoteLines +=
            '<div class="flex justify-between gap-3 text-sm py-1"><span class="text-gray-600">' +
            est.guests.countable +
            ' ' +
            t('res_unit_guest') +
            '</span><span class="text-secondary text-xs font-semibold">&gt; ' +
            est.maxGuests +
            '</span></div>';
        }
        linesEl.innerHTML = quoteLines;
      }
      if (totalEl) totalEl.textContent = t('res_quote_only');
      if (depositEl) {
        depositEl.textContent = t('res_line_deposit') + ': ' + euro(est.deposit);
      }
      if (submitBtn) submitBtn.innerHTML = t('res_submit_quote');
    } else {
      if (quoteEl) quoteEl.classList.add('hidden');
      if (linesEl) {
        var pricedHtml = est.lines
          .map(function (line) {
            return (
              '<div class="flex justify-between gap-3 text-sm py-1"><span class="text-gray-600">' +
              line.label +
              '</span><span class="font-medium">' +
              euro(line.amount) +
              '</span></div>'
            );
          })
          .join('');
        var quoteHtml = (est.quoteExtras || [])
          .map(function (name) {
            return (
              '<div class="flex justify-between gap-3 text-sm py-1"><span class="text-gray-600">' +
              name +
              '</span><span class="text-secondary text-xs font-semibold">' +
              t('res_quote_only') +
              '</span></div>'
            );
          })
          .join('');
        linesEl.innerHTML = pricedHtml + quoteHtml;
      }
      if (totalEl) totalEl.textContent = euro(est.total);
      if (depositEl) {
        depositEl.textContent = t('res_line_deposit') + ': ' + euro(est.deposit);
      }
      if (submitBtn) submitBtn.innerHTML = t('res_submit');
    }

    if (window.pdsIcons) window.pdsIcons.hydrate(submitBtn);
  }

  function syncDurationHint() {
    readDuration();
  }

  function syncObsPlaceholder(est) {
    var obs = document.getElementById('campo_observacoes');
    if (!obs) return;
    obs.placeholder = est && est.needsQuote ? t('res_ph_obs_quote') : t('res_ph_obs');
  }

  function fillHiddenSummary(est) {
    var summary = document.getElementById('orcamento_resumo');
    var mode = document.getElementById('modo_pedido');
    var typeLabel = document.getElementById('tipo_evento_label');
    if (!summary || !mode) return;
    if (!est || !est.ready) {
      summary.value = '';
      mode.value = '';
      if (typeLabel) typeLabel.value = '';
      return;
    }
    if (typeLabel) typeLabel.value = loc(est.et.label);
    var g = est.guests;
    var parts = [
      loc(est.et.label),
      est.date,
      'Início: ' + est.start,
      'Fim: ' + est.end + (est.nextDay ? ' (+1 dia)' : ''),
      'Duração: ' + formatHours(est.hoursExact) + 'h (faturado ' + est.hours + 'h)',
      est.holiday
        ? t('res_day_holiday')
        : est.weekend
          ? t('res_day_weekend')
          : t('res_day_weekday'),
    ];
    if (g.split) {
      parts.push('Adultos: ' + g.adults);
      parts.push('Crianças 3+: ' + g.kids);
    } else {
      parts.push('Pessoas 3+: ' + g.countable);
    }
    parts.push('Menores de 3: ' + g.under3);
    parts.push('Contam para capacidade: ' + g.countable);
    if (est.overCapacity) {
      parts.push('Acima de ' + est.maxGuests + ' pessoas — sob consulta');
    }
    parts.push('Espaço: ' + (est.overCapacity ? 'sob consulta' : euro(est.venue)));
    if (est.needsQuote) {
      parts.push('Modo: proposta');
      if (est.quoteExtras.length) {
        parts.push('Extras sob consulta: ' + est.quoteExtras.join(', '));
      }
    } else {
      parts.push('Modo: reserva');
      est.lines.slice(1).forEach(function (line) {
        parts.push(line.label + ': ' + euro(line.amount));
      });
      parts.push('Total estimado: ' + euro(est.total));
    }
    parts.push('Caução: ' + euro(est.deposit));
    summary.value = parts.join(' | ');
    mode.value = est.needsQuote ? 'proposta' : 'reserva';
  }

  function recalculate() {
    var est = computeEstimate();
    renderEstimate(est);
    syncObsPlaceholder(est);
    fillHiddenSummary(est);
  }

  function onEventTypeChange() {
    syncGuestFields();
    renderExtras();
    syncDurationHint();
    recalculate();
  }

  function refreshLabels() {
    var form = document.getElementById('form_reservas');
    fillEventTypes();
    fillTimeSelects();
    syncGuestFields();
    renderExtras();
    syncDurationHint();
    recalculate();
    if (form) syncFormConfigWarning(form);
    if (window.pdsIcons) window.pdsIcons.hydrate();
  }

  async function init() {
    var form = document.getElementById('form_reservas');
    if (!form) return;

    try {
      var res = await fetch('data/pricing.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('pricing');
      pricing = await res.json();
      extrasById = {};
      (pricing.extras || []).forEach(function (e) {
        extrasById[e.id] = e;
      });
    } catch (err) {
      var errBox = document.getElementById('pricing_error');
      if (errBox) {
        errBox.textContent = t('res_load_error');
        errBox.classList.remove('hidden');
      }
      return;
    }

    var dateInput = document.getElementById('data_evento');
    if (dateInput) {
      dateInput.min = new Date().toISOString().split('T')[0];
    }

    fillEventTypes();
    fillTimeSelects();
    syncGuestFields();
    syncDurationHint();
    renderExtras();
    recalculate();
    syncFormConfigWarning(form);

    ['tipo_evento'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('change', onEventTypeChange);
    });
    [
      'data_evento',
      'hora_inicio',
      'hora_fim',
      'num_adultos',
      'num_criancas',
      'num_pessoas',
      'num_under3',
    ].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', recalculate);
        el.addEventListener('change', recalculate);
      }
    });
    document.addEventListener('input', function (e) {
      if (e.target && e.target.matches('[data-extra-qty]')) recalculate();
    });
    document.addEventListener('pds:langchange', refreshLabels);

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      recalculate();
      var submitBtn = document.getElementById('btn_submit');
      var original = submitBtn.innerHTML;
      var accessKey = getAccessKey(form);
      if (!isAccessKeyConfigured(accessKey)) {
        alert(t('res_err_access_key'));
        return;
      }
      submitBtn.disabled = true;
      submitBtn.innerHTML = t('res_sending');
      if (window.pdsIcons) window.pdsIcons.hydrate(submitBtn);

      try {
        var response = await fetch(form.action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
        });
        var result = await response.json();
        if (web3formsAccepted(result, accessKey)) {
          if (window.pdsTrack) window.pdsTrack('generate_lead');
          var tpl = document.getElementById('tpl_reserva_sucesso');
          var node = tpl.content.cloneNode(true);
          node.querySelector('[data-success-title]').textContent = t('res_success_title');
          node.querySelector('[data-success-body]').textContent = t('res_success_body');
          node.querySelector('[data-success-home]').textContent = t('res_success_home');
          form.parentElement.replaceChildren(node);
          if (window.pdsIcons) window.pdsIcons.hydrate();
        } else {
          alert(web3formsMessage(result) || t('res_err_send'));
          submitBtn.disabled = false;
          submitBtn.innerHTML = original;
          if (window.pdsIcons) window.pdsIcons.hydrate(submitBtn);
        }
      } catch (error) {
        alert(t('res_err_network'));
        submitBtn.disabled = false;
        submitBtn.innerHTML = original;
        if (window.pdsIcons) window.pdsIcons.hydrate(submitBtn);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
