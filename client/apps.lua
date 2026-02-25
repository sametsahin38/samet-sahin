RegisterNUICallback('dialNumber', function(data, cb)
    local number = tostring(data.number or '')
    if number == '' then
        cb({ ok = false })
        return
    end

    TriggerEvent('chat:addMessage', {
        color = { 0, 200, 120 },
        args = { 'Telefon', ('Araniyor: %s'):format(PhoneUtils.FormatPhoneNumber(number)) }
    })

    cb({ ok = true })
end)

RegisterNUICallback('openBrowserUrl', function(data, cb)
    local url = tostring(data.url or '')
    if url == '' then
        cb({ ok = false })
        return
    end

    if not url:find('http') then
        url = 'https://' .. url
    end

    SendNUIMessage({ action = 'browserUrl', payload = url })
    cb({ ok = true, url = url })
end)

RegisterNUICallback('calculate', function(data, cb)
    local expression = tostring(data.expression or '')
    if expression == '' then
        cb({ ok = true, result = 0 })
        return
    end

    local fn = load('return ' .. expression)
    if not fn then
        cb({ ok = false, result = 'Hata' })
        return
    end

    local ok, result = pcall(fn)
    cb({ ok = ok, result = ok and result or 'Hata' })
end)
