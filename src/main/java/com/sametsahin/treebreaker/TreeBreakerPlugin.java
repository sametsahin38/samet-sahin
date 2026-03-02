package com.sametsahin.treebreaker;

import org.bukkit.plugin.java.JavaPlugin;

public class TreeBreakerPlugin extends JavaPlugin {

    @Override
    public void onEnable() {
        saveDefaultConfig();
        getServer().getPluginManager().registerEvents(new TreeBreakListener(this), this);
        getLogger().info("TreeBreaker aktif: artık odun evler yanlışlıkla kırılmayacak.");
    }
}
