local QBCore = exports['qb-core']:GetCoreObject()
local PhoneOpen = false
local CachedState = nil

local function SetPhoneState(state)
    CachedState = state
    SendNUIMessage({
        action = 'hydrate',
        payload = state
    })
end

local function OpenPhone(state)
    PhoneOpen = true
    SetNuiFocus(true, true)
    SendNUIMessage({ action = 'setVisible', payload = true })
    if state then
        SetPhoneState(state)
    else
        QBCore.Functions.TriggerCallback('qb-smartphone:server:getPhoneState', function(response)
            SetPhoneState(response)
        end)
    end
end

local function ClosePhone()
    PhoneOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'setVisible', payload = false })
end

RegisterNetEvent('qb-smartphone:client:openPhone', function(state)
    OpenPhone(state)
end)

RegisterCommand(Config.OpenCommand, function()
    TriggerServerEvent('qb-smartphone:server:openPhone')
end)

RegisterKeyMapping(Config.OpenCommand, 'Cep Telefonu', 'keyboard', Config.OpenKey)

RegisterNUICallback('closePhone', function(_, cb)
    ClosePhone()
    cb({ ok = true })
end)

RegisterNUICallback('saveSettings', function(data, cb)
    TriggerServerEvent('qb-smartphone:server:saveSettings', data)
    cb({ ok = true })
end)

RegisterNUICallback('saveContacts', function(data, cb)
    TriggerServerEvent('qb-smartphone:server:saveContacts', data)
    cb({ ok = true })
end)

RegisterNUICallback('saveNotes', function(data, cb)
    TriggerServerEvent('qb-smartphone:server:saveNotes', data)
    cb({ ok = true })
end)

RegisterNUICallback('sendMessage', function(data, cb)
    TriggerServerEvent('qb-smartphone:server:sendMessage', data)
    cb({ ok = true })
end)

RegisterNUICallback('searchDirectory', function(data, cb)
    TriggerServerEvent('qb-smartphone:server:searchDirectory', data.query)
    cb({ ok = true })
end)

RegisterNUICallback('deletePhoto', function(data, cb)
    TriggerServerEvent('qb-smartphone:server:deletePhoto', data.id)
    cb({ ok = true })
end)

RegisterNetEvent('qb-smartphone:client:pushMessage', function(message)
    if CachedState then
        CachedState.messages = CachedState.messages or {}
        table.insert(CachedState.messages, 1, message)
        SendNUIMessage({ action = 'pushMessage', payload = message })
    end
end)

RegisterNetEvent('qb-smartphone:client:messageSent', function()
    QBCore.Functions.Notify('Mesaj gonderildi.', 'success')
end)

RegisterNetEvent('qb-smartphone:client:searchResults', function(rows)
    SendNUIMessage({ action = 'searchResults', payload = rows })
end)

RegisterNUICallback('capturePhoto', function(data, cb)
    exports['screenshot-basic']:requestScreenshotUpload('', 'files[]', function(result)
        local image = json.decode(result)
        if image and image.attachments and image.attachments[1] then
            TriggerServerEvent('qb-smartphone:server:savePhoto', {
                image = image.attachments[1].proxy_url,
                caption = data.caption
            })
            cb({ ok = true, image = image.attachments[1].proxy_url })
        else
            cb({ ok = false })
        end
    end)
end)

RegisterNUICallback('setWaypoint', function(data, cb)
    local coords = data.coords
    if coords then
        SetNewWaypoint(coords.x + 0.0, coords.y + 0.0)
        QBCore.Functions.Notify('Konum isaretlendi.', 'success')
    end
    cb({ ok = true })
end)

CreateThread(function()
    while true do
        if PhoneOpen and IsControlJustReleased(0, 322) then
            ClosePhone()
        end
        Wait(0)
    end
end)
