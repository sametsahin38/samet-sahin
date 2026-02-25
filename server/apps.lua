local QBCore = exports['qb-core']:GetCoreObject()

local function GetPlayerPhoneNumber(source)
    local player = QBCore.Functions.GetPlayer(source)
    if not player then return nil end
    local profile = MySQL.single.await('SELECT phone_number FROM phone_profiles WHERE citizenid = ?', { player.PlayerData.citizenid })
    return profile and profile.phone_number or nil
end

RegisterNetEvent('qb-smartphone:server:sendMessage', function(payload)
    local src = source
    local sender = GetPlayerPhoneNumber(src)
    if not sender or PhoneUtils.IsEmpty(payload.to) or PhoneUtils.IsEmpty(payload.message) then
        return
    end

    local receiver = tostring(payload.to):gsub('%D', '')
    MySQL.insert('INSERT INTO phone_messages (sender, receiver, message) VALUES (?, ?, ?)', {
        sender,
        receiver,
        payload.message
    })

    local target = QBCore.Functions.GetPlayers()
    for _, playerId in ipairs(target) do
        local phone = GetPlayerPhoneNumber(playerId)
        if phone == receiver then
            TriggerClientEvent('qb-smartphone:client:pushMessage', playerId, {
                sender = sender,
                receiver = receiver,
                message = payload.message,
                sent_at = os.date('%Y-%m-%d %H:%M:%S')
            })
            TriggerClientEvent('QBCore:Notify', playerId, ('Yeni mesaj: %s'):format(payload.message), 'primary')
            break
        end
    end

    TriggerClientEvent('qb-smartphone:client:messageSent', src)
end)

RegisterNetEvent('qb-smartphone:server:savePhoto', function(payload)
    local src = source
    local player = QBCore.Functions.GetPlayer(src)
    if not player then return end

    MySQL.insert('INSERT INTO phone_gallery (citizenid, image, caption) VALUES (?, ?, ?)', {
        player.PlayerData.citizenid,
        payload.image,
        payload.caption or ''
    })

    TriggerClientEvent('QBCore:Notify', src, 'Fotograf galeriye kaydedildi.', 'success')
end)

RegisterNetEvent('qb-smartphone:server:deletePhoto', function(photoId)
    local src = source
    local player = QBCore.Functions.GetPlayer(src)
    if not player then return end

    MySQL.update('DELETE FROM phone_gallery WHERE id = ? AND citizenid = ?', { photoId, player.PlayerData.citizenid })
end)

RegisterNetEvent('qb-smartphone:server:searchDirectory', function(query)
    local src = source
    local filter = ('%%%s%%'):format(query or '')
    local rows = MySQL.query.await('SELECT phone_number FROM phone_profiles WHERE phone_number LIKE ? LIMIT 10', { filter })
    TriggerClientEvent('qb-smartphone:client:searchResults', src, rows)
end)
