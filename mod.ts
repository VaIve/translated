import * as slash from "https://raw.githubusercontent.com/DjDeveloperr/harmony/refactor/deploy.ts";

// Pick up TOKEN and PUBLIC_KEY from ENV.
slash.init({ env: true });

const ACTIVITIES: {
  [name: string]: {
    id: string;
    name: string;
  };
} = {
  poker: {
    id: "755827207812677713",
    name: "Poker Night",
  },
  betrayal: {
    id: "773336526917861400",
    name: "Betrayal.io",
  },
  youtube: {
    id: "755600276941176913",
    name: "YouTube",
  },
  fishing: {
    id: "814288819477020702",
    name: "Fishington.io",
  },
};

// Create Slash Commands if not present
slash.commands.all().then((e) => {
  if (e.size !== 2) {
    slash.commands.bulkEdit([
      {
        name: "atividade",
        description: "Começa uma atividade em um canal de voz.",
        options: [
          {
            name: "canal",
            type: slash.SlashCommandOptionType.CHANNEL,
            description: "Canal de voz que a atividade vai começar.",
            required: true,
          },
          {
            name: "atividade",
            type: slash.SlashCommandOptionType.STRING,
            description: "Qual atividade começar.",
            required: true,
            choices: Object.entries(ACTIVITIES).map((e) => ({
              name: e[1].name,
              value: e[0],
            })),
          },
        ],
      },
    ]);
  }
});

slash.handle("activity", (d) => {
  if (!d.guild) return;
  const channel = d.option<slash.InteractionChannel>("channel");
  const activity = ACTIVITIES[d.option<string>("activity")];
  if (!channel || !activity) {
    return d.reply("Interação invalida, cheque minhas permissões.", { ephemeral: true });
  }
  if (channel.type !== slash.ChannelTypes.GUILD_VOICE) {
    return d.reply("Atividades podem ser iniciadas apenas em um canal de voz.", {
      ephemeral: true,
    });
  }

  slash.client.rest.api.channels[channel.id].invites
    .post({
      max_age: 604800,
      max_uses: 0,
      target_application_id: activity.id,
      target_type: 2,
      temporary: false,
    })
    .then((inv) => {
      d.reply(
        `[Clique aqui para começar ${activity.name} no canal ${channel.name}.](<https://discord.gg/${inv.code}>)`
      );
    })
    .catch((e) => {
      console.log("Falhou", e);
      d.reply("Atividade Falhou.", { ephemeral: true });
    });
});


slash.handle("*", (d) => d.reply("Erro.", { ephemeral: true }));
slash.client.on("Erro de interação", console.log);
