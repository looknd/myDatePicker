(function($, undefined) {
	//判断闰年
	function isLeapYear(year){
		return (year%4==0 && year%100!=0) || (year%400==0);
	}

	//还原
	function restore(show, hide) {
		for(var i = 0, j = show.length; i < j; i++) {
			show[i][0].style.display = '';
		}
		for(var i = 0, j = hide.length;i < j;i++) {
			hide[i][0].style.display = 'none';
		}
	}

	function closest($obj, $obj2) {
		return $obj.closest($obj2).length > 0;
	}

	function complement(val) {
		return val < 10 ? '0'+val : val;
	}

	//hack jquery2.0
	function hackOverflow() {
		//jquery2.0版本会将overflow设置成hidden
		$.style(this, 'overflow', 'visible');
	}

	var datepicker = '<div class="ui-date"><div class="ui-date-container"><div class="w-5-6 ui-date-select"><div class="w-1-2"><div class="w-4-5"><a href="#"onclick="return false;"hidefocus="true"><div class="ui-date-year"><div class="w-3-4 ui-date-text">2013</div><div class="w-1-4 ui-date-arrow"><div class="ui-date-arrow-blank"></div></div></div></a></div><div class="w-1-5"><span class="ui-date-text">年</span></div></div><div class="w-1-2"><div class="w-1-5"></div><div class="w-3-5"><a href="#"onclick="return false;"hidefocus="true"><div class="ui-date-month"><div class="w-2-3 ui-date-text">12</div><div class="w-1-3 ui-date-arrow"><div class="ui-date-arrow-blank"></div></div></div></a></div><div class="w-1-5"><span class="ui-date-text">月</span></div></div></div><div class="w-19-24 ui-date-year-options"><div><a href="#"onclick="return false;"hidefocus="true"class="ui-date-slideleft"><div class="ui-date-arrow"></div></a><a href="#"onclick="return false;"hidefocus="true"class="ui-date-slideright"><div class="ui-date-arrow"></div></a><a href="#"onclick="return false;"hidefocus="true"class="ui-date-slideup"><div class="ui-date-slideup-arrow"></div></a></div><div class="ui-date-year-option"></div></div><div class="w-19-24 ui-date-month-options"><div><a href="#"onclick="return false;"hidefocus="true"class="ui-date-slideup"><div class="ui-date-slideup-arrow"></div></a></div><div class="ui-date-month-option"></div></div><div class="w-11-12 ui-date-datatime"><div class="nor"><span>周一</span><span>周二</span><span>周三</span><span>周四</span><span>周五</span><span>周六</span><span>周日</span></div><div></div></div></div></div>',
		//定义闰年和平年每月的总天数
		nonleapYear = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], leapYear = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
		domATpl = document.createElement('a'),
		domSpan = document.createElement('span'),
		domDiv = document.createElement('div');

	domATpl.setAttribute('href', 'javascript:void(0);');
	domATpl.setAttribute('hidefocus', 'true');

	function Datepicker() {
		this.id = 'datepicker_' + this.defaults.initDate.getTime();
		var $el = this.$el = $(datepicker);
		this._$year_options = this.$el.find('div.ui-date-year-options');
		this._$year_option = this._$year_options.find('> div.ui-date-year-option');
		this._$month_options = this.$el.find('div.ui-date-month-options');
		this._$everyday = this.$el.find('div.ui-date-datatime');
		this._$year_text = this.$el.find('.ui-date-year > div.ui-date-text');
		this._$month_text = this.$el.find('.ui-date-month > div.ui-date-text');
		this.options = $.extend({}, this.defaults);
		this._bind();
	}

	$.extend(Datepicker.prototype, {
		//默认设置
		defaults: {
			dateFormat: 'yyyy-MM-dd',
			initDate: new Date()
		},
		//显示
		show: function($input, options) {
			$input = $input instanceof jQuery ? $input : $($input);
			if($input.length) {
				this.$el.css({
					display: 'block',
					left: $input.offset().left,
					top: $input.offset().top + $input.outerHeight(true)
				});
				this.$input = $input;
				this.initialize(options);
			}
		},
		//隐藏
		hide: function() {
			restore([this._$everyday.finish()], [this._$year_options.finish(), this._$month_options.finish(), this.$el]);
		},
		//格式化日期
		formatDate: function(date, format) {
			format = format || this.defaults.dateFormat;
			return format.replace('yyyy', date.getFullYear())
						.replace('MM', complement(date.getMonth() + 1))
						.replace('dd', complement(date.getDate()));
		},
		//转化日期
		parseDate: function(str, format) {
			format = format || this.defaults.dateFormat;
			return new Date(+str.substr(format.search('yyyy'), 4), +str.substr(format.search('MM'), 2) - 1, +str.substr(format.search('dd'), 2));
		},
		//初始化
		initialize: function(options) {
			this.options = $.extend({}, this.defaults, $.data(this.$input[0], 'option'), options);
			var value = this.$input[0].value;
			
			this._datetime = value ? this.parseDate(value) : this.options.initDate;
			this._origin = {
				yyyy: this._datetime.getFullYear(),
				MM: this._datetime.getMonth() + 1,
				dd: this._datetime.getDate()
			};
			this._dest = $.extend({}, this._origin);
			this._$year_text.text(this._dest.yyyy);
			this._$month_text.text(this._dest.MM);
			this._$year_option.empty().append(this._createYear(this._dest.yyyy));
			this._$year_option_inner = null;
			this._$month_options.append(this._createMonth()).find('> div:eq(1)').remove();
			this._changeDate();
		},
		//定义事件
		_events: {
			"changeDate": "_changeDate",
			"click .ui-date-year": "_slideYear",
			"click .ui-date-month": "_slideMonth",
			"click .ui-date-year-options a.ui-date-slideup": "_slideUpYear",
			"click .ui-date-month-options a.ui-date-slideup": "_slideUpMonth",
			"click .ui-date-year-options a.ui-date-slideleft" : "_slideLeft",
			"click .ui-date-year-options a.ui-date-slideright" : "_slideRight",
			"click .ui-date-year-option a": "_selectYear",
			"click .ui-date-month-option a": "_selectMonth",
			"click .ui-date-datatime a": "_selectDate"
		},
		//绑定事件
		_bind: function() {
			var _this = this, regexp = /(\S+)(\s+)(.*)/;
			$.each(this._events, function(key, value) {
				var data = key.match(regexp), callback = function() {
					$.isFunction(_this[value]) && _this[value].apply(_this, arguments);
				};
				data ? _this.$el.on(data[1], data[3], callback) : _this.$el.on(key, callback);
			});
		},
		//创建月份
		_createYear: function(year) {
			var years = domDiv.cloneNode(false);
			//years.className = 'yui3-u';
			for(var i = year, j = year - 9; i > j; i--) {
				var dom = years.appendChild(domATpl.cloneNode(false));
				i == this._dest.yyyy && (dom.className = 'ui-date-datatime-selected');
				dom.appendChild(document.createTextNode(''+i));
			}
			return years;
		},
		//创建月份
		_createMonth: function() {
			var month = domDiv.cloneNode(false);
			month.className = 'ui-date-month-option';
			for(var i = 1; i <= 12; i++) {
				var dom = month.appendChild(domATpl.cloneNode(false));
				i == this._dest.MM && (dom.className = 'ui-date-datatime-selected');
				dom.appendChild(document.createTextNode(''+i));			}
			return month;
		},
		//切换日期
		_changeDate: function() {
			var arr = isLeapYear(this._dest.yyyy) ? leapYear : nonleapYear, datetime = new Date(this._datetime.getTime());
			datetime.setFullYear(this._dest.yyyy);
			datetime.setMonth(this._dest.MM-1);
			datetime.setDate(1);
			//计算每月1号在网格的位置
			begin = (datetime.getDay() || 7) - 1;
			//计算网格
			var grid = document.createElement('div'), maxDays = arr[this._dest.MM-1];
			for(var i = 1, j = Math.ceil((maxDays + begin) / 7) * 7; i <= j; i++) {
				var dom, day = i - begin;
				if(day > 0 && day <= maxDays) {
					dom = domATpl.cloneNode(false);
					dom.appendChild(document.createTextNode(''+day));
					day == this._dest.dd && (dom.className = 'ui-date-datatime-selected');
				}else{
					dom = domSpan.cloneNode(false);
				}
				grid.appendChild(dom);
			}
			this._$everyday.find('> div:last-child').remove();
			this._$everyday.append(grid);
		},
		//展开年份
		_slideYear: function() {
			this._$month_options.height() > 1 && this._$month_options.slideUp();
			this._$everyday.finish()[$.css(this._$year_options.finish()[0], 'display') === 'none' ? 'slideUp' : 'slideDown']();
			this._$year_options.slideToggle(hackOverflow);
		},
		//收起年份
		_slideUpYear: function() {
			this._$year_options.slideUp();
			this._$everyday.slideDown();
		},
		//展开月份
		_slideMonth: function() {
			this._$year_options.height() > 1 && this._$year_options.slideUp();
			this._$everyday.finish()[$.css(this._$month_options.finish()[0], 'display') === 'none' ? 'slideUp' : 'slideDown']();
			this._$month_options.slideToggle(hackOverflow);
		},
		//收起年份
		_slideUpMonth: function() {
			this._$month_options.slideUp();
			this._$everyday.slideDown();
		},
		//选择天
		_selectDate: function(evt) {
			this._$everyday.find('a.ui-date-datatime-selected').removeClass('ui-date-datatime-selected');
			evt.target.className = 'ui-date-datatime-selected';
			this._dest.dd = +$.text(evt.target), dateString = this.options.dateFormat;
			$.extend(this._origin, this._dest);
			$.each(this._dest, function(key) {
				dateString = dateString.replace(key, complement(this));
			});
			if($.isFunction(this.options.onSelect)) {
				this.options.onSelect.call(this.$input[0], dateString, this._dest.yyyy, this._dest.MM, this._dest.dd);
			}else{
				this.$input && this.$input.val(dateString);
			}
			this.hide();
		},
		//选择年份
		_selectYear: function(evt) {
			var _newValue = +$.text(evt.target), changed = this._dest.yyyy != _newValue;
			changed && this._$year_text.text((this._dest.yyyy = _newValue));
			this._selectYears(evt, this._$year_options, changed);
		},
		//选择月份
		_selectMonth: function(evt) {
			var _newValue = +$.text(evt.target), changed = this._dest.MM != _newValue;
			changed && this._$month_text.text((this._dest.MM = _newValue));
			this._selectYears(evt, this._$month_options, changed);
		},
		_selectYears: function(evt, $options, changed) {
			$options.slideUp();
			this._$everyday.slideDown();
			if(changed) {
				this._changeDate();
				$options.find('a.ui-date-datatime-selected').removeClass('ui-date-datatime-selected');
				evt.target.className = 'ui-date-datatime-selected';
			}
		},
		//日历向右滑动
		_slideRight: function() {
			this._fixOption();
			var $children = this._$year_option_inner.children(),
				$child = $children.eq(this._year_page++),
				width = $children.width(),
				_this = this;
			this._$year_option_inner.finish().animate({left: -this._year_page*width});
			!$child.next().length && this._$year_option_inner.append($(this._createYear(+$child.find('> a:first-child').text() - 9)).width(width).addClass('yui3-u'));
		},
		//日历向左滑动
		_slideLeft: function() {
			this._fixOption();
			var $children = this._$year_option_inner.children(),
				$child = $children.eq(this._year_page),
				width = $children.width(),
				_this = this;
			!$child.prev().length ? this._$year_option_inner.finish().prepend($(this._createYear(+$child.find('> a:first-child').text() + 9)).width(width).addClass('yui3-u')).css({left: this._year_page*width-width}).animate({left: this._year_page*width}) : this._$year_option_inner.finish().animate({left: -width*(--this._year_page)});
		},
		_fixOption: function() {
			if(!this._$year_option_inner) {
				var $first = this._$year_option.find('> :first-child'),
				width = $first.width(),
				height = $first.height();
				this._$year_option_inner = $(domDiv.cloneNode(false))
					.addClass('yui3-g ui-date-year-option-inner')
					.height(height)
					.append($first.width(width).addClass('yui3-u'))
					.appendTo(this._$year_option.height(height));
				this._year_page = 0;
			}
		}
	});

	$.fn.calendarpicker = function(options) {
		$.calendarpicker || ($.calendarpicker = new Datepicker());
		closest($.calendarpicker.$el, 'body') || $.calendarpicker.$el.appendTo('body');
		$(this).on('mousedown', function(evt) {
			$.calendarpicker.show(this, options);
		});
		$(document).on('mousedown', function(evt) {
			var $target = $(evt.target);
			!closest($target, $.calendarpicker.$input) && 
				!closest($target, $.calendarpicker.$el) && 
				!closest($target, $.calendarpicker.options.handler) &&
				$.calendarpicker.hide();
		});
		return this.each(function() {
			var $this = $(this), option = $this.data('option');
			
			option = option && eval('('+option+')');
			$.data(this, 'option', option);

			option && option.handler && $(option.handler).on('mousedown', function(evt) {
				$this.mousedown();
			});
		});
	};
})(jQuery, undefined);