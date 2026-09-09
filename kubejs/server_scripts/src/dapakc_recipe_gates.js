// priority: 50
// dapakc — restore CTNH's progression gates against added-mod shortcuts.
// Scope: only mods added on top of CTNH v1.4.3a. Reviewed decisions from Hunter:
//   shafts   -> original shaft + the variant material (brass done GT-style)
//   copycats -> shaft + zinc instead of bare zinc stonecutting
//   creative casing -> left alone, decorative
//   CBC      -> delete the alloy shortcuts outright

ServerEvents.recipes(event => {

    // =====================================================================
    // 1. Create Big Cannons — delete the alloy shortcuts.
    //    These land in forge:ingots/{steel,bronze}, which AlmostUnified
    //    unifies toward gtceu. All four produce 2 ingots per craft.
    // =====================================================================
    ;[
        'createbigcannons:mixing/alloy_steel',          // 2 iron  + 1 coal        -> 2 steel
        'createbigcannons:mixing/alloy_bronze_tin',     // copper  + tin           -> 2 bronze
        'createbigcannons:mixing/alloy_bronze_brass',   // 2 brass + cinder flour  -> 2 bronze
        'createbigcannons:mixing/alloy_bronze_tinless', // copper  + zinc + flour  -> 2 bronze
    ].forEach(id => event.remove({ id: id }))

    // Belt-and-braces: catch any alloy route re-added under another id.
    event.remove({ type: 'create:mixing', output: 'createbigcannons:steel_ingot' })
    event.remove({ type: 'create:mixing', output: 'createbigcannons:bronze_ingot' })

    // KEPT DELIBERATELY:
    //   compacting/iron_to_cast_iron_ingot  (1 iron + 1 coal -> 1 cast iron)
    //   cast_iron is NOT in almostunified materials, so it stays CBC-internal
    //   and remains the early-game cannon path. Steel/bronze cannons now wait
    //   on GregTech, which is the point.
    //   melting/* and compacting/forge_* are a closed molten<->solid loop and
    //   create no new metal.

    // =====================================================================
    // 2. Create Encased shafts — original shaft + the variant material.
    //    Was: 2 material -> 8 shafts, no shaft required.
    //    Now: 4 shafts + 1 material -> 4 variants (same material ratio,
    //    plus CTNH's andesite-alloy shaft cost underneath).
    // =====================================================================
    const SHAFT_MATERIALS = {
        acacia:   'minecraft:stripped_acacia_log',
        birch:    'minecraft:stripped_birch_log',
        cherry:   'minecraft:stripped_cherry_log',
        crimson:  'minecraft:stripped_crimson_stem',
        dark_oak: 'minecraft:stripped_dark_oak_log',
        jungle:   'minecraft:stripped_jungle_log',
        mangrove: 'minecraft:stripped_mangrove_log',
        oak:      'minecraft:stripped_oak_log',
        spruce:   'minecraft:stripped_spruce_log',
        warped:   'minecraft:stripped_warped_stem',
        bamboo:   'minecraft:stripped_bamboo_block',
        glass:    'minecraft:glass',
    }

    Object.keys(SHAFT_MATERIALS).forEach(name => {
        const variant = `createcasing:${name}_shaft`
        event.remove({ output: variant })
        event.shapeless(Item.of(variant, 4),
            ['4x create:shaft', SHAFT_MATERIALS[name]]
        ).id(`dapakc:shafts/${name}_shaft`)
    })

    // Brass shaft — the one with real extra function (holds past 32 RPM),
    // so it gets the GregTech treatment. Was: 1 create:brass_ingot -> 6, cutting.
    event.remove({ output: 'createcasing:brass_shaft' })
    event.shapeless(Item.of('createcasing:brass_shaft', 2),
        ['2x create:shaft', 'gtceu:brass_rod']
    ).id('dapakc:shafts/brass_shaft')
    // Alternative, closer to CTNH's own idiom in create.js
    // (`create.cutting('2x create:shaft', 'gtceu:andesite_alloy_ingot')`) —
    // swap in if you'd rather it be a saw recipe than a crafting one:
    // event.recipes.create.cutting('2x createcasing:brass_shaft', 'gtceu:brass_rod')

    // =====================================================================
    // 3. Copycats+ — shaft only.
    //    The decorative copycat shapes keep their zinc stonecutting; a
    //    shaft+zinc cost makes no sense for a slab or a ladder. But
    //    copycats:copycat_shaft transmits rotation, so it's a shaft like any
    //    other and gets the same treatment as the Create Encased ones.
    //    Was: stonecutting, 1 zinc -> 4.
    // =====================================================================
    event.remove({ type: 'minecraft:stonecutting', output: 'copycats:copycat_shaft' })
    event.shapeless(Item.of('copycats:copycat_shaft', 4),
        ['4x create:shaft', '#forge:ingots/zinc']
    ).id('dapakc:copycats/copycat_shaft')

    // Left alone deliberately: every other copycat shape (decorative), and
    // copycat_cogwheel / copycat_large_cogwheel / copycat_fluid_pipe, which
    // already consume 4x the real Create part and so inherit CTNH's gate.

    // =====================================================================
    // 4. Create Encased machine variants — variant = real Create machine
    //    + the casing. 155 items across 8 casings, so CTNH's gate on each
    //    base machine now applies to every skin of it.
    // =====================================================================
    const CASINGS = {
        andesite:         'create:andesite_casing',
        brass:            'create:brass_casing',
        copper:           'create:copper_casing',
        railway:          'create:railway_casing',
        industrial_iron:  'create:industrial_iron_block',
        weathered_iron:   'create:weathered_iron_block',
        refined_radiance: 'create:refined_radiance_casing',
        shadow_steel:     'create:shadow_steel_casing',
        creative:         'createcasing:creative_casing',
    }

    // variant suffix -> the Create block it stands in for. All verified
    // present in create-1.20.1-6.0.8.jar.
    const MACHINES = {
        encased_fan:                'create:encased_fan',
        press:                      'create:mechanical_press',
        mixer:                      'create:mechanical_mixer',
        depot:                      'create:depot',
        portable_storage_interface: 'create:portable_storage_interface',
        mechanical_drill:           'create:mechanical_drill',
        mechanical_saw:             'create:mechanical_saw',
        mechanical_harvester:       'create:mechanical_harvester',
        mechanical_plough:          'create:mechanical_plough',
        mechanical_roller:          'create:mechanical_roller',
        deployer:                   'create:deployer',
        clutch:                     'create:clutch',
        gearshift:                  'create:gearshift',
        gearbox:                    'create:gearbox',
        chain_conveyor:             'create:chain_conveyor',
        encased_chain_drive:        'create:encased_chain_drive',
        adjustable_chain_gearshift: 'create:adjustable_chain_gearshift',
        configurable_gearbox:       'create:gearbox',          // Encased-only block
    }

    Object.keys(CASINGS).forEach(mat => {
        Object.keys(MACHINES).forEach(suffix => {
            const variant = `createcasing:${mat}_${suffix}`
            if (!Item.exists(variant)) return
            event.remove({ output: variant })
            event.shapeless(variant, [MACHINES[suffix], CASINGS[mat]])
                .id(`dapakc:encased/${mat}_${suffix}`)
        })
        // vertical_<mat>_gearbox — note the prefix order
        const vert = `createcasing:vertical_${mat}_gearbox`
        if (Item.exists(vert)) {
            event.remove({ output: vert })
            event.shapeless(vert, ['create:vertical_gearbox', CASINGS[mat]])
                .id(`dapakc:encased/vertical_${mat}_gearbox`)
        }
    })

    // createcasing:creative_casing and its chorium line are left alone —
    // decorative, per your call.

    // =====================================================================
    // 5. Power Grid — remove its power conversion, keep the electronics.
    //    CTNH already owns EU <-> rotation, tiered, in CTPP:
    //      Kinetic Output Box (EU -> rotation)  ULV .. LV HV EV IV LuV
    //                                           UHV UEV UIV UXV OpV MAX
    //      Kinetic Input Box  (rotation -> EU)  same ladder
    //      Kinetic Generator  (rotation -> EU, wants lubricant)
    //      Kinetic Steam Turbine, Kinetic Create Mixer, Electric Gearbox
    //    All enabled in config/ctpp.yaml, torque scaling 4.0 with voltage
    //    level — so more stress means climbing GregTech, by design.
    //    Power Grid duplicates both directions at andesite tier, ungated,
    //    because CTNH has no idea it is installed. Every removal below has a
    //    CTNH equivalent; nothing is lost from the pack.
    //    KEPT: FE Inverter, Device Connector, batteries, and the whole
    //    electronics/logic layer, which has no CTNH counterpart and is the
    //    entire reason to run the mod.
    // =====================================================================

    // -- electricity -> rotation.  CTNH: Kinetic Output Box (15 tiers).
    //    Power Grid's motor is copper coils + a magnet + a shaft, and its
    //    stress capacity scales with Power Grid voltage (raised with
    //    transformers) rather than with GregTech tier. Flat bypass.
    ;['powergrid:electric_motor', 'powergrid:constant_speed_motor']
        .forEach(id => { if (Item.exists(id)) event.remove({ output: id }) })

    // -- rotation -> electricity.  CTNH: Kinetic Input Box, Kinetic Generator.
    //    Also duplicates create_new_age, which CTNH gates behind
    //    gtceu:resin_printed_circuit_board.
    ;[
        'powergrid:generator_housing',
        'powergrid:vertical_generator_housing',
        'powergrid:generator_induction_rotor',
        'powergrid:generator_large_induction_rotor',
        'powergrid:generator_commutator',
        'powergrid:generator_vertical_commutator',
        'powergrid:generator_clutch',
    ].forEach(id => { if (Item.exists(id)) event.remove({ output: id }) })

    // -- free energy. No CTNH equivalent because there isn't one.
    ;['powergrid:solar_panel', 'powergrid:ceiling_tile_solar', 'powergrid:solar_panel_bearing']
        .forEach(id => { if (Item.exists(id)) event.remove({ output: id }) })

    // -- the joke starter cell; a trickle source once generation is gone.
    if (Item.exists('powergrid:potato_battery')) {
        event.remove({ output: 'powergrid:potato_battery' })
    }

    // ORDERING CONSEQUENCE: Power Grid now has no power of its own. Electricity
    // enters only through the FE Inverter, so it comes from CTNH's economy —
    // GT cables emit FE natively (compat.energy.nativeEUToFE), and Create: New
    // Age makes FE behind its RPCB gate. The electronics layer therefore moves
    // behind the pack's first electricity gate. Intended, but it is a change to
    // when the mod becomes usable.

})
