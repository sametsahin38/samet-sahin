local QBCore = exports['qb-core']:GetCoreObject()
local PhoneOpen = false
local CameraMode = false
local CameraFront = false
local LocalPhoneState = nil

local function IsSilent()
    return LocalPhoneState and LocalPhoneState.settings and LocalPhoneState.settings.silentMode == true
end

local function IsDnd()
    return LocalPhoneState and LocalPhoneState.settings and LocalPhoneState.settings.doNotDisturb == true
end

local function SetPhoneState(state)
    LocalPhoneState = state
    SendNUIMessage({ action = 'hydrate', payload = state })
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
    CameraMode = false
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
    if LocalPhoneState then
        LocalPhoneState.settings = data
    end
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

RegisterNUICallback('shareLocation', function(data, cb)
    TriggerServerEvent('qb-smartphone:server:sendLocationMessage', { to = data.to })
    cb({ ok = true })
end)

RegisterNUICallback('deletePhoto', function(data, cb)
    TriggerServerEvent('qb-smartphone:server:deletePhoto', data.id)
    cb({ ok = true })
end)

RegisterNUICallback('setWaypoint', function(data, cb)
    local coords = data.coords
    if coords then
        SetNewWaypoint(coords.x + 0.0, coords.y + 0.0)
        QBCore.Functions.Notify('Konum işaretlendi.', 'success')
    end
    cb({ ok = true })
end)

RegisterNUICallback('setCameraMode', function(data, cb)
    CameraMode = data and data.enabled == true
    cb({ ok = true })
end)

RegisterNUICallback('capturePhoto', function(data, cb)
    exports['screenshot-basic']:requestScreenshotUpload('', 'files[]', function(result)
        local image = json.decode(result)
        if image and image.attachments and image.attachments[1] then
            local photo = image.attachments[1].proxy_url
            TriggerServerEvent('qb-smartphone:server:savePhoto', { image = photo, caption = data.caption })
            cb({ ok = true, image = photo, front = CameraFront })
        else
            cb({ ok = false })
        end
    end)
end)

RegisterNetEvent('qb-smartphone:client:pushMessage', function(message)
    if message and LocalPhoneState and LocalPhoneState.me and message.receiver == LocalPhoneState.me.phone then
        if not IsDnd() then
            local preview = tostring(message.message or '')
            if #preview > 45 then preview = preview:sub(1, 45) .. '...' end
            QBCore.Functions.Notify(('Yeni mesaj (%s): %s'):format(message.sender or 'Bilinmeyen', preview), 'primary')
        end

        if not IsSilent() then
            PlaySoundFrontend(-1, 'Text_Arrive_Tone', 'Phone_SoundSet_Default', true)
            SendNUIMessage({ action = 'playNotificationSound' })
        end
    end

    SendNUIMessage({ action = 'pushMessage', payload = message })
end)

RegisterNetEvent('qb-smartphone:client:messageSent', function()
    QBCore.Functions.Notify('Mesaj gönderildi.', 'success')
end)

RegisterNetEvent('qb-smartphone:client:searchResults', function(rows)
    SendNUIMessage({ action = 'searchResults', payload = rows })
end)

RegisterNetEvent('qb-smartphone:client:twitterFeed', function(posts)
    SendNUIMessage({ action = 'twitterFeed', payload = posts })
end)

RegisterNetEvent('qb-smartphone:client:twitterFeedBroadcast', function(posts)
    SendNUIMessage({ action = 'twitterFeed', payload = posts })
end)

RegisterNetEvent('qb-smartphone:client:twitterRegisterResult', function(payload)
    SendNUIMessage({ action = 'twitterRegisterResult', payload = payload })
end)

RegisterNetEvent('qb-smartphone:client:twitterLoginResult', function(payload)
    SendNUIMessage({ action = 'twitterLoginResult', payload = payload })
end)

RegisterNUICallback('twitterRegister', function(_, cb)
    TriggerServerEvent('qb-smartphone:server:twitterRegister')
    cb({ ok = true })
end)

RegisterNUICallback('twitterLogin', function(data, cb)
    TriggerServerEvent('qb-smartphone:server:twitterLogin', data)
    cb({ ok = true })
end)

RegisterNUICallback('twitterPost', function(data, cb)
    TriggerServerEvent('qb-smartphone:server:twitterPost', data)
    cb({ ok = true })
end)

RegisterNUICallback('twitterFeed', function(_, cb)
    TriggerServerEvent('qb-smartphone:server:getTwitterFeed')
    cb({ ok = true })
end)

CreateThread(function()
    while true do
        if PhoneOpen and IsControlJustReleased(0, Config.CloseControl) then
            SendNUIMessage({ action = 'hardwareBack' })
        end

        if PhoneOpen and CameraMode then
            if IsControlJustReleased(0, 191) then -- ENTER
                SendNUIMessage({ action = 'cameraCaptureKey' })
            end
            if IsControlJustReleased(0, 25) then -- RIGHT MOUSE
                CameraFront = not CameraFront
                SendNUIMessage({ action = 'cameraFlipped', payload = CameraFront })
                QBCore.Functions.Notify(CameraFront and 'Ön kamera aktif.' or 'Arka kamera aktif.', 'primary')
            end
        end

        Wait(0)
    end
end)
