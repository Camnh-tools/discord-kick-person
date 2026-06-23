const { MessageFlags, PermissionFlagsBits } = require('discord.js');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchMembersWithRetry(guild, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await guild.members.fetch();
        } catch (err) {
            lastError = err;

            if (err.name === 'GatewayRateLimitError' && err.data?.retry_after) {
                const retryMs = Math.ceil(err.data.retry_after * 1000) + 1000;

                console.log(`Rate limited. Retry after ${retryMs}ms...`);
                await wait(retryMs);
                continue;
            }

            throw err;
        }
    }

    throw lastError;
}

async function safeReply(interaction, content) {
    if (interaction.deferred || interaction.replied) {
        return interaction.editReply(content);
    }

    return interaction.reply({
        content,
        flags: MessageFlags.Ephemeral
    });
}

function canBotManageRole(botMember, role) {
    if (!role) return false;
    if (role.managed) return false;

    return botMember.roles.highest.comparePositionTo(role) > 0;
}

async function kickWithSpecificRole(interaction, role) {
    const guild = interaction.guild;

    if (!guild) {
        return interaction.reply({
            content: 'Command này chỉ dùng được trong server.',
            flags: MessageFlags.Ephemeral
        });
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.KickMembers)) {
        return interaction.reply({
            content: 'Bạn không có quyền Kick Members.',
            flags: MessageFlags.Ephemeral
        });
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageRoles)) {
        return interaction.reply({
            content: 'Bạn không có quyền Manage Roles.',
            flags: MessageFlags.Ephemeral
        });
    }

    const botMember = guild.members.me;

    if (!botMember.permissions.has(PermissionFlagsBits.KickMembers)) {
        return interaction.reply({
            content: 'Bot chưa có quyền Kick Members.',
            flags: MessageFlags.Ephemeral
        });
    }

    if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return interaction.reply({
            content: 'Bot chưa có quyền Manage Roles để xóa role khỏi member.',
            flags: MessageFlags.Ephemeral
        });
    }

    if (!role || role.id === guild.id) {
        return interaction.reply({
            content: 'Role không hợp lệ.',
            flags: MessageFlags.Ephemeral
        });
    }

    if (role.managed) {
        return interaction.reply({
            content: `Role **${role.name}** là managed role, không thể xóa thủ công.`,
            flags: MessageFlags.Ephemeral
        });
    }

    if (!canBotManageRole(botMember, role)) {
        return interaction.reply({
            content:
                `Bot không thể quản lý role **${role.name}**.\n` +
                `Hãy kéo role của bot lên cao hơn role **${role.name}** trong Server Settings > Roles.`,
            flags: MessageFlags.Ephemeral
        });
    }

    await interaction.deferReply({
        flags: MessageFlags.Ephemeral
    });

    try {
        await fetchMembersWithRetry(guild);
    } catch (err) {
        console.error(err);

        return interaction.editReply(
            'Không thể tải danh sách member vì Discord đang rate limit. Hãy thử lại sau một lúc.'
        );
    }

    const members = guild.members.cache.filter(member =>
        member.roles.cache.has(role.id) &&
        !member.user.bot
    );

    if (members.size === 0) {
        return interaction.editReply(
            `Không có member nào có role **${role.name}**.`
        );
    }

    let removedRole = 0;
    let kicked = 0;
    let failed = 0;
    let skipped = 0;

    for (const member of members.values()) {
        try {
            const realRoles = member.roles.cache.filter(r =>
                r.id !== guild.id
            );

            // Nếu member có từ 2 role thật trở lên:
            // chỉ xóa role đang chọn, không kick.
            if (realRoles.size >= 2) {
                await member.roles.remove(
                    role,
                    `Remove role ${role.name} because member has multiple roles`
                );

                removedRole++;

                console.log(`Removed role ${role.name} from ${member.displayName} ✅`);
                console.log(`=======`);

                await wait(1000);
                continue;
            }

            // Nếu member chỉ có đúng 1 role thật:
            // kick khỏi server.
            if (realRoles.size === 1) {
                if (!member.kickable) {
                    failed++;

                    console.log(`Cannot kick ${member.displayName} ❌`);
                    console.log(`=======`);

                    continue;
                }

                await member.kick(`Only role was ${role.name}`);

                kicked++;

                console.log(`Kicked ${member.displayName} ✅`);
                console.log(`=======`);

                await wait(1000);
                continue;
            }

            skipped++;

            console.log(`Skipped ${member.displayName} ⚠️`);
            console.log(`=======`);
        } catch (err) {
            failed++;

            console.error(`Không xử lý được ${member.displayName}:`, err.message);
            console.log(`=======`);
        }
    }

    return interaction.editReply(
        `Đã xử lý role **${role.name}**.\n` +
        `Xóa role khỏi member: **${removedRole}**\n` +
        `Kick member: **${kicked}**\n` +
        `Bỏ qua: **${skipped}**\n` +
        `Thất bại: **${failed}**`
    );
}

module.exports = kickWithSpecificRole;