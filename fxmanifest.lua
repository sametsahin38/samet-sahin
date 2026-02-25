fx_version 'cerulean'
game 'gta5'

lua54 'yes'

author 'samet-sahin + GPT-5.2-Codex'
description 'QBCore tabanli gelismis cep telefonu sistemi'
version '1.0.0'

ui_page 'html/index.html'

shared_scripts {
    'config.lua',
    'shared/utils.lua'
}

client_scripts {
    'client/main.lua',
    'client/apps.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua',
    'server/apps.lua'
}

files {
    'html/index.html',
    'html/style.css',
    'html/app.js'
}

dependency 'qb-core'
