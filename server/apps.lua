local QBCore = exports['qb-core']:GetCoreObject()

local function EnsureTwitterTables()
    MySQL.query([[
        CREATE TABLE IF NOT EXISTS `phone_twitter_users` (
            `citizenid` VARCHAR(60) NOT NULL,
            `username` VARCHAR(60) NOT NULL,
            `password` VARCHAR(60) NOT NULL,
            PRIMARY KEY (`citizenid`),
            UNIQUE KEY `username` (`username`)
        );
    ]])

    MySQL.query([[
        CREATE TABLE IF NOT EXISTS `phone_twitter_posts` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `citizenid` VARCHAR(60) NOT NULL,
            `username` VARCHAR(60) NOT NULL,
            `content` TEXT NOT NULL,
            `image` LONGTEXT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ]])
end

local function GetPlayer(source)
    return QBCore.Functions.GetPlayer(source)
end

local function GetPlayerPhoneNumber(source)
    local player = GetPlayer(source)
    if not player then return nil end
    local profile = MySQL.single.await('SELECT phone_number FROM phone_profiles WHERE citizenid = ?', { player.PlayerData.citizenid })
    return profile and profile.phone_number or nil
end

local function randomCredential(prefix)
    return (prefix .. math.random(10000, 99999)):lower()
end

RegisterNetEvent('qb-smartphone:server:sendMessage', function(payload)
    local src = source
    local sender = GetPlayerPhoneNumber(src)
    if not sender or PhoneUtils.IsEmpty(payload.to) or PhoneUtils.IsEmpty(payload.message) then return end

    local receiver = tostring(payload.to):gsub('%D', '')
    MySQL.insert('INSERT INTO phone_messages (sender, receiver, message) VALUES (?, ?, ?)', { sender, receiver, payload.message })

    for _, playerId in ipairs(QBCore.Functions.GetPlayers()) do
        if GetPlayerPhoneNumber(playerId) == receiver then
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
    local player = GetPlayer(source)
    if not player then return end

    MySQL.insert('INSERT INTO phone_gallery (citizenid, image, caption) VALUES (?, ?, ?)', {
        player.PlayerData.citizenid,
        payload.image,
        payload.caption or ''
    })

    TriggerClientEvent('QBCore:Notify', source, 'Fotoğraf galeriye kaydedildi.', 'success')
end)

RegisterNetEvent('qb-smartphone:server:deletePhoto', function(photoId)
    local player = GetPlayer(source)
    if not player then return end
    MySQL.update('DELETE FROM phone_gallery WHERE id = ? AND citizenid = ?', { photoId, player.PlayerData.citizenid })
end)

RegisterNetEvent('qb-smartphone:server:searchDirectory', function(query)
    local filter = ('%%%s%%'):format(query or '')
    local rows = MySQL.query.await('SELECT phone_number FROM phone_profiles WHERE phone_number LIKE ? LIMIT 10', { filter })
    TriggerClientEvent('qb-smartphone:client:searchResults', source, rows)
end)

RegisterNetEvent('qb-smartphone:server:getTwitterFeed', function()
    local posts = MySQL.query.await('SELECT id, username, content, image, created_at FROM phone_twitter_posts ORDER BY created_at DESC LIMIT 80')
    TriggerClientEvent('qb-smartphone:client:twitterFeed', source, posts or {})
end)

RegisterNetEvent('qb-smartphone:server:twitterRegister', function()
    local src = source
    local player = GetPlayer(src)
    if not player then return end

    local citizenid = player.PlayerData.citizenid
    local existing = MySQL.single.await('SELECT username, password FROM phone_twitter_users WHERE citizenid = ?', { citizenid })
    if existing then
        TriggerClientEvent('qb-smartphone:client:twitterRegisterResult', src, { ok = true, username = existing.username, password = existing.password, existing = true })
        return
    end

    local username
    repeat username = randomCredential('user') until not MySQL.single.await('SELECT username FROM phone_twitter_users WHERE username = ?', { username })
    local password = randomCredential('pw')

    MySQL.insert.await('INSERT INTO phone_twitter_users (citizenid, username, password) VALUES (?, ?, ?)', {
        citizenid,
        username,
        password
    })

    TriggerClientEvent('qb-smartphone:client:twitterRegisterResult', src, { ok = true, username = username, password = password, existing = false })
end)

RegisterNetEvent('qb-smartphone:server:twitterLogin', function(payload)
    local src = source
    local player = GetPlayer(src)
    if not player then return end

    local row = MySQL.single.await('SELECT username, password FROM phone_twitter_users WHERE citizenid = ?', { player.PlayerData.citizenid })
    local ok = row and payload and payload.username == row.username and payload.password == row.password
    TriggerClientEvent('qb-smartphone:client:twitterLoginResult', src, {
        ok = ok,
        username = row and row.username or nil
    })
end)

RegisterNetEvent('qb-smartphone:server:twitterPost', function(payload)
    local src = source
    local player = GetPlayer(src)
    if not player then return end

    local row = MySQL.single.await('SELECT username FROM phone_twitter_users WHERE citizenid = ?', { player.PlayerData.citizenid })
    if not row then return end

    local content = tostring(payload.content or '')
    if content == '' then return end

    MySQL.insert.await('INSERT INTO phone_twitter_posts (citizenid, username, content, image) VALUES (?, ?, ?, ?)', {
        player.PlayerData.citizenid,
        row.username,
        content,
        payload.image
    })

    local posts = MySQL.query.await('SELECT id, username, content, image, created_at FROM phone_twitter_posts ORDER BY created_at DESC LIMIT 80')
    TriggerClientEvent('qb-smartphone:client:twitterFeedBroadcast', -1, posts or {})
end)

AddEventHandler('onResourceStart', function(name)
    if name ~= GetCurrentResourceName() then return end
    EnsureTwitterTables()
end)
