# Tekrar tetiklenebilmesi icin advancement'i geri al
advancement revoke @s only treebreaker:mined_log

# Calisma flag'i
scoreboard players set @s tb.run 0

# Sadece balta ile calissin
execute if data entity @s SelectedItem{id:"minecraft:wooden_axe"} run scoreboard players set @s tb.run 1
execute if data entity @s SelectedItem{id:"minecraft:stone_axe"} run scoreboard players set @s tb.run 1
execute if data entity @s SelectedItem{id:"minecraft:iron_axe"} run scoreboard players set @s tb.run 1
execute if data entity @s SelectedItem{id:"minecraft:golden_axe"} run scoreboard players set @s tb.run 1
execute if data entity @s SelectedItem{id:"minecraft:diamond_axe"} run scoreboard players set @s tb.run 1
execute if data entity @s SelectedItem{id:"minecraft:netherite_axe"} run scoreboard players set @s tb.run 1

# Balta yoksa devam etmez
execute if score @s tb.run matches 1 run kill @e[type=minecraft:marker,tag=tb_target,distance=..16]
execute if score @s tb.run matches 1 run function treebreaker:find_target
execute if score @s tb.run matches 1 if entity @e[type=minecraft:marker,tag=tb_target,limit=1,distance=..6] run function treebreaker:validate_and_break
execute if score @s tb.run matches 1 run kill @e[type=minecraft:marker,tag=tb_target,distance=..16]
