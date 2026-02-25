local QBCore = exports['qb-core']:GetCoreObject()

local function CreatePhoneTables()
    MySQL.query([[
        CREATE TABLE IF NOT EXISTS `phone_profiles` (
            `citizenid` VARCHAR(60) NOT NULL,
            `phone_number` VARCHAR(20) NOT NULL,
            `settings` LONGTEXT NULL,
            `contacts` LONGTEXT NULL,
            `notes` LONGTEXT NULL,
            PRIMARY KEY (`citizenid`),
            UNIQUE KEY `phone_number` (`phone_number`)
        );
    ]])

    MySQL.query([[
        CREATE TABLE IF NOT EXISTS `phone_messages` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `sender` VARCHAR(20) NOT NULL,
            `receiver` VARCHAR(20) NOT NULL,
            `message` TEXT NOT NULL,
            `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ]])

    MySQL.query([[
        CREATE TABLE IF NOT EXISTS `phone_gallery` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `citizenid` VARCHAR(60) NOT NULL,
            `image` LONGTEXT NOT NULL,
            `caption` VARCHAR(120) DEFAULT '',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ]])
end

local function RandomPhoneNumber()
    return math.random(100, 999) .. math.random(1000, 9999)
end

local function BuildInstalledApps(settings)
    local installed = settings.installedApps or {}
    local appMap = {}

    for _, app in ipairs(Config.CoreApps) do
        table.insert(appMap, PhoneUtils.DeepCopy(app))
    end

    for _, app in ipairs(Config.StoreApps) do
        if installed[app.id] then
            table.insert(appMap, PhoneUtils.DeepCopy(app))
        end
    end

    return appMap
end

local function ResolvePhoneProfile(citizenid)
    local profile = MySQL.single.await('SELECT * FROM phone_profiles WHERE citizenid = ?', { citizenid })
    if profile then return profile end

    local number
    repeat
        number = RandomPhoneNumber()
    until not MySQL.single.await('SELECT citizenid FROM phone_profiles WHERE phone_number = ?', { number })

    local defaultSettings = {
        wallpaper = Config.DefaultWallpaper,
        installedApps = {
            gallery = true,
            twitter = true
        }
    }

    MySQL.insert.await('INSERT INTO phone_profiles (citizenid, phone_number, settings, contacts, notes) VALUES (?, ?, ?, ?, ?)', {
        citizenid,
        number,
        json.encode(defaultSettings),
        json.encode({}),
        json.encode({})
    })

    return MySQL.single.await('SELECT * FROM phone_profiles WHERE citizenid = ?', { citizenid })
end

local function BuildPhoneState(source)
    local player = QBCore.Functions.GetPlayer(source)
    if not player then return nil end

    local citizenid = player.PlayerData.citizenid
    local profile = ResolvePhoneProfile(citizenid)
    if not profile then return nil end

    local settings = json.decode(profile.settings or '{}') or {}
    settings.installedApps = settings.installedApps or {}
    settings.wallpaper = settings.wallpaper or Config.DefaultWallpaper

    local sent = MySQL.query.await('SELECT * FROM phone_messages WHERE sender = ? OR receiver = ? ORDER BY sent_at DESC LIMIT 150', {
        profile.phone_number,
        profile.phone_number
    })

    local gallery = MySQL.query.await('SELECT id, image, caption, created_at FROM phone_gallery WHERE citizenid = ? ORDER BY created_at DESC LIMIT ?', {
        citizenid,
        Config.MaxGalleryPhotos
    })

    return {
        me = {
            name = player.PlayerData.charinfo.firstname .. ' ' .. player.PlayerData.charinfo.lastname,
            citizenid = citizenid,
            phone = profile.phone_number
        },
        settings = settings,
        contacts = json.decode(profile.contacts or '[]') or {},
        notes = json.decode(profile.notes or '[]') or {},
        messages = sent or {},
        gallery = gallery or {},
        apps = BuildInstalledApps(settings),
        coreApps = Config.CoreApps,
        storeApps = Config.StoreApps,
        mapLocations = Config.MapLocations,
        wallpaperPresets = Config.WallpaperPresets
    }
end

RegisterNetEvent('qb-smartphone:server:openPhone', function()
    local src = source
    local player = QBCore.Functions.GetPlayer(src)
    if not player then return end

    if Config.EnableItemRequired and not player.Functions.GetItemByName(Config.PhoneItem) then
        TriggerClientEvent('QBCore:Notify', src, 'Telefon eşyası gerekli.', 'error')
        return
    end

    TriggerClientEvent('qb-smartphone:client:openPhone', src, BuildPhoneState(src))
end)

QBCore.Functions.CreateCallback('qb-smartphone:server:getPhoneState', function(source, cb)
    cb(BuildPhoneState(source))
end)

RegisterNetEvent('qb-smartphone:server:saveSettings', function(settings)
    local src = source
    local player = QBCore.Functions.GetPlayer(src)
    if not player then return end
    MySQL.update('UPDATE phone_profiles SET settings = ? WHERE citizenid = ?', {
        json.encode(settings),
        player.PlayerData.citizenid
    })
end)

RegisterNetEvent('qb-smartphone:server:saveContacts', function(contacts)
    local src = source
    local player = QBCore.Functions.GetPlayer(src)
    if not player then return end
    MySQL.update('UPDATE phone_profiles SET contacts = ? WHERE citizenid = ?', { json.encode(contacts), player.PlayerData.citizenid })
end)

RegisterNetEvent('qb-smartphone:server:saveNotes', function(notes)
    local src = source
    local player = QBCore.Functions.GetPlayer(src)
    if not player then return end
    MySQL.update('UPDATE phone_profiles SET notes = ? WHERE citizenid = ?', { json.encode(notes), player.PlayerData.citizenid })
end)

AddEventHandler('onResourceStart', function(name)
    if name ~= GetCurrentResourceName() then return end
    CreatePhoneTables()
    print('[qb-smartphone] Database initialized.')
end)
