# Oyuncuya yakin log bulur (kirdigin blok civari)
execute positioned ~ ~ ~ if block ~ ~ ~ #minecraft:logs unless entity @e[type=minecraft:marker,tag=tb_target,distance=..6,limit=1] run summon minecraft:marker ~ ~ ~ {Tags:["tb_target"]}
execute positioned ~ ~-1 ~ if block ~ ~ ~ #minecraft:logs unless entity @e[type=minecraft:marker,tag=tb_target,distance=..6,limit=1] run summon minecraft:marker ~ ~-1 ~ {Tags:["tb_target"]}
execute positioned ~ ~1 ~ if block ~ ~ ~ #minecraft:logs unless entity @e[type=minecraft:marker,tag=tb_target,distance=..6,limit=1] run summon minecraft:marker ~ ~1 ~ {Tags:["tb_target"]}
execute positioned ~1 ~ ~ if block ~ ~ ~ #minecraft:logs unless entity @e[type=minecraft:marker,tag=tb_target,distance=..6,limit=1] run summon minecraft:marker ~1 ~ ~ {Tags:["tb_target"]}
execute positioned ~-1 ~ ~ if block ~ ~ ~ #minecraft:logs unless entity @e[type=minecraft:marker,tag=tb_target,distance=..6,limit=1] run summon minecraft:marker ~-1 ~ ~ {Tags:["tb_target"]}
execute positioned ~ ~ ~1 if block ~ ~ ~ #minecraft:logs unless entity @e[type=minecraft:marker,tag=tb_target,distance=..6,limit=1] run summon minecraft:marker ~ ~ ~1 {Tags:["tb_target"]}
execute positioned ~ ~ ~-1 if block ~ ~ ~ #minecraft:logs unless entity @e[type=minecraft:marker,tag=tb_target,distance=..6,limit=1] run summon minecraft:marker ~ ~ ~-1 {Tags:["tb_target"]}
