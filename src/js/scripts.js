jQuery(function ($) {
    const Helper = {
        serializeForm: function ($form) {
            let o = {},
                a = $form.serializeArray();

            if (!a.length) {
                a = $form.find('input, select, textarea').serializeArray();
            }

            $.each(a, function () {
                if (o[this.name]) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[this.name]];
                    }
                    o[this.name].push(this.value || '');
                } else {
                    o[this.name] = this.value || '';
                }
            });
            return o;
        },
        scrollTo: function (target, offset, speed, timeout, container) {
            if (isNaN(target)) {

                if (!(target instanceof jQuery)) {
                    target = $(target);
                }
                if (!target.length) {
                    return;
                }
                target = parseInt(target.offset().top);
            }

            container = container || 'html, body';
            if (!(container instanceof jQuery)) {
                container = $(container);
            }


            speed = speed || 500;
            timeout = timeout || 0;
            offset = offset || 0;

            setTimeout(function () {
                container.animate({
                    scrollTop: target + offset
                }, speed);
            }, timeout);

        },
    };
    const Checkout = {
        data: [],
        form: $('form.checkout'),
        submitButton: $('.submit-checkout-form'),
        errorsMessages: {
            empty_value: 'Обов’язкове поле',
            phone_format: 'Необхідно ввести номер у форматі +48',
            alphabets: 'Необхідно використати A-z символи',
            incorrect_email: 'У введеному email пропущені символи',
            incorrect_country: 'Некоректна назва країни',
            zip_format: 'Необхідно ввести код у форматі XX-XXX',
            incorrect_city: 'Некоректна назва міста',
            incorrect_street: 'Некоректна адреса',
        },
        errors: [],
        ajaxurl: 'AJAX URL',
        init: function () {
            let self = this;

            self.submitButton.click(function (e) {
                e.preventDefault();
                if (self.validateForm()) {
                    $.post(self.ajaxurl, {
                        data: self.form.serialize(),
                        action: 'checkout',
                    }, function (response) {
                        if (response.success) {
                            alert('Mission complete!');
                        } else {
                            alert('Something wrong!');
                        }
                    }, 'json');
                } else {
                    Helper.scrollTo(self.form.find('.error:first'), -100);
                }
            });

            $('[data-toggle-target]').click(function () {
                let $this = $(this),
                    $target = $($this.data('toggle-target'));

                if ($target.length) {
                    $target.slideToggle();
                }
            });

            $('[data-toggle-target-required-fields]').click(function () {
                let $this = $(this),
                    $target = $($this.data('toggle-target-required-fields'));

                if ($target.length) {
                    if ($this.prop('checked')) {
                        $target.find('input').prop('required', $this.prop('checked'));
                        $target.slideToggle();
                    } else {
                        $target.slideToggle(function () {
                            $target.find('input').prop('required', $this.prop('checked'));
                        });
                    }
                }
            });

            $('.input-field').on('input keyup keydown', 'input', function () {
                let $this = $(this),
                    value = $this.val();
                if ($this.attr('required')) {
                    self.validate($this, value);
                }

                self.autofillCityAndStreet($this);
            });

            self.validateCurrentValue();
            $('input, select, textarea').on('focus', function () {
                self.removeError($(this));
            });
        },
        validateCurrentValue: function () {
            let self = this,
                fields = self.form.find('input, select, textarea');

            fields.each(function () {
                let $this = $(this),
                    value = $this.val();

                if ($this.attr('required') && typeof $this.attr('value') !== 'undefined' && $this.attr('value') !== '') {
                    if ($this.attr('type') === 'text') {
                        self.validate($this, value);
                    }
                } else {
                    self.removeError($this);
                }
            });
        },
        validateForm: function () {
            let self = this,
                fields = self.form.find('input, select, textarea');
            self.errors = [];
            fields.each(function () {
                let $this = $(this),
                    value = $this.val();
                if ($this.attr('required')) {
                    if ($this.attr('type') === 'text') {
                        self.validate($this, value);
                    }
                } else {
                    self.removeError($this);
                }
            });
            return !self.errors.length;
        },
        validate: function (input, value) {
            let self = this;
            if (value !== '') {
                if (input.hasClass('validate-email')) {
                    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
                        self.setValid(input);
                    } else {
                        self.setError(input, self.errorsMessages.incorrect_email);
                    }
                } else if (input.hasClass('validate-zip')) {
                    if (/^\d{2}-\d{3}$/.test(value)) {
                        self.setValid(input);
                    } else {
                        self.setError(input, self.errorsMessages.zip_format);
                    }
                } else if (input.hasClass('validate-phone')) {
                    if (/^\+48\d{9}$/.test(value)) {
                        self.setValid(input);
                    } else {
                        self.setError(input, self.errorsMessages.phone_format);
                    }
                } else if (input.hasClass('validate-alphabets')) {
                    if (/^[A-Za-z]+$/.test(value)) {
                        self.setValid(input);
                    } else {
                        self.setError(input, self.errorsMessages.alphabets);
                    }
                } else if (input.hasClass('validate-country')) {
                    if (/^(польща|poland)$/.test(value.toLowerCase())) {
                        self.setValid(input);
                    } else {
                        self.setError(input, self.errorsMessages.alphabets);
                    }
                } else if (input.hasClass('validate-city')) {
                    if (/^[A-Za-z\s]+$/.test(value) && !(/^[\s\d]+$/.test(value))) {
                        self.setValid(input);
                    } else {
                        self.setError(input, self.errorsMessages.incorrect_city);
                    }
                } else if (input.hasClass('validate-street')) {
                    if (/^[A-Za-z\s\d]+$/.test(value) && !(/^[\s\d]+$/.test(value))) {
                        self.setValid(input);
                    } else {
                        self.setError(input, self.errorsMessages.incorrect_street);
                    }
                } else {
                    self.setValid(input);
                }
            } else {
                self.setError(input, self.errorsMessages.empty_value);
            }
        },
        setError: function (input, message) {
            let $parent = input.parent();
            $parent.addClass('error').removeClass('valid').find('.error-message').remove();
            $parent.append($('<span>').addClass('error-message').text(message));
            this.errors.push(input.attr('name'));
        },
        removeError: function (input) {
            input.parent().removeClass('error').find('.error-message').remove();
        },
        setValid: function (input) {
            input.parent().removeClass('error').addClass('valid').find('.error-message').remove();
        },
        autofillCityAndStreet: function (input) {
            let self = this;
            if (/country|zip$/.test(input.attr('name')) && input.parent().hasClass('valid')) {
                let $parent = input.parents('.address-fields:first'),
                    $country = $parent.find('input[name$="country"]'),
                    $zip = $parent.find('input[name$="zip"]'),
                    $city = $parent.find('input[name$="city"]'),
                    $street = $parent.find('input[name$="street"]');

                if ($country.parent().hasClass('valid') && $zip.parent().hasClass('valid')) {
                    self.getZipInfo($country.val(), $zip.val(), function (info) {
                        if (info) {
                            $city.val(info.place);
                            $street.val(info.province);
                            self.validate($city);
                            self.validate($street);
                        }
                    });
                }
            }
        },
        getZipInfo: function (country, zip, callback) {
            country = 'PL';
            $.getJSON('/zipcodes.pl.json', function (data) {
                let find = data.filter(element => element.zipcode === zip && element.country_code === country);
                let zipInfo = find.length ? find[0] : false;
                callback(zipInfo);
            });
        },
    };

    Checkout.init();
});
