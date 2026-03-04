import { PlayerModel } from "../models/player-model";
import { StatisticsModel } from "../models/statistics-model";
import * as PlayerRepository from "../repositories/players-repository";
import * as HttpResponse from "../utils/http-helper";

type PlayerSortField = "name" | "overall";
type SortOrder = "asc" | "desc";
type StatsMetric = keyof StatisticsModel;

interface PlayerFilters {
  name?: string;
  club?: string;
  nationality?: string;
  position?: string;
}

interface PlayerQueryOptions extends PlayerFilters {
  sort?: string;
  order?: string;
  limit?: number;
}

const statsKeys: StatsMetric[] = [
  "Overall",
  "Pace",
  "Shooting",
  "Passing",
  "Dribbling",
  "Defending",
  "Physical",
];

const normalizeText = (value: string) => value.trim().toLowerCase();

const parseSort = (sort?: string): PlayerSortField | undefined => {
  if (!sort) return undefined;

  const normalized = normalizeText(sort);
  if (normalized === "overall") return "overall";
  if (normalized === "name") return "name";

  return undefined;
};

const parseOrder = (order?: string): SortOrder | undefined => {
  if (!order) return undefined;

  const normalized = normalizeText(order);
  if (normalized === "asc" || normalized === "desc") return normalized;

  return undefined;
};

const parseMetric = (metric?: string): StatsMetric | undefined => {
  if (!metric) return undefined;

  const normalized = normalizeText(metric);
  return statsKeys.find((key) => normalizeText(key) === normalized);
};

const applyFilters = (players: PlayerModel[], filters: PlayerFilters) => {
  return players.filter((player) => {
    if (
      filters.name &&
      !normalizeText(player.name).includes(normalizeText(filters.name))
    ) {
      return false;
    }

    if (
      filters.club &&
      !normalizeText(player.club).includes(normalizeText(filters.club))
    ) {
      return false;
    }

    if (
      filters.nationality &&
      !normalizeText(player.nationality).includes(
        normalizeText(filters.nationality)
      )
    ) {
      return false;
    }

    if (
      filters.position &&
      !normalizeText(player.position).includes(normalizeText(filters.position))
    ) {
      return false;
    }

    return true;
  });
};

const applySorting = (
  players: PlayerModel[],
  sort: PlayerSortField,
  order: SortOrder
) => {
  return [...players].sort((left, right) => {
    if (sort === "overall") {
      const diff = left.statistics.Overall - right.statistics.Overall;
      return order === "asc" ? diff : -diff;
    }

    const comparison = left.name.localeCompare(right.name);
    return order === "asc" ? comparison : -comparison;
  });
};

export const getPlayerService = async () => {
  const data = await PlayerRepository.findAllPlayers();

  if (!data || data.length === 0) {
    return HttpResponse.noContent();
  }

  return HttpResponse.ok(data);
};

export const getPlayersAdvancedService = async (query: PlayerQueryOptions) => {
  const data = await PlayerRepository.findAllPlayers();

  const sort = parseSort(query.sort);
  const order = parseOrder(query.order) ?? "desc";

  let filteredPlayers = applyFilters(data, {
    name: query.name,
    club: query.club,
    nationality: query.nationality,
    position: query.position,
  });

  if (sort) {
    filteredPlayers = applySorting(filteredPlayers, sort, order);
  }

  if (query.limit && query.limit > 0) {
    filteredPlayers = filteredPlayers.slice(0, query.limit);
  }

  if (filteredPlayers.length === 0) {
    return HttpResponse.noContent();
  }

  return HttpResponse.ok(filteredPlayers);
};

export const getPlayerByIdService = async (id: number) => {
  const data = await PlayerRepository.findPlayerById(id);

  if (!data) {
    return HttpResponse.noContent();
  }

  return HttpResponse.ok(data);
};

export const createPlayerService = async (player: PlayerModel) => {
  if (!player || Object.keys(player).length === 0) {
    return HttpResponse.badRequest();
  }

  if (
    !player.name ||
    !player.club ||
    !player.nationality ||
    !player.position ||
    !player.statistics
  ) {
    return HttpResponse.badRequest();
  }

  const requiredMetrics = statsKeys.every((metric) => {
    return typeof player.statistics[metric] === "number";
  });

  if (!requiredMetrics) {
    return HttpResponse.badRequest();
  }

  const players = await PlayerRepository.findAllPlayers();
  const maxId = players.reduce((max, current) => Math.max(max, current.id), 0);
  const idInUse = players.some((item) => item.id === player.id);

  if (!player.id || player.id <= 0 || idInUse) {
    player.id = maxId + 1;
  }

  await PlayerRepository.insertPlayer(player);
  return HttpResponse.created();
};

export const deletePlayerService = async (id: number) => {
  const isDeleted = await PlayerRepository.deleteOnePlayer(id);

  if (!isDeleted) {
    return HttpResponse.badRequest();
  }

  return HttpResponse.ok({ message: "deleted" });
};

export const updatePlayerService = async (
  id: number,
  statistics: StatisticsModel
) => {
  const hasAllStats = statsKeys.every((metric) => {
    return typeof statistics?.[metric] === "number";
  });

  if (!hasAllStats) {
    return HttpResponse.badRequest();
  }

  const data = await PlayerRepository.findAndModifyPlayer(id, statistics);

  if (!data) {
    return HttpResponse.badRequest();
  }

  return HttpResponse.ok(data);
};

export const getTopPlayersByMetricService = async (
  metricInput?: string,
  limitInput?: number
) => {
  const metric = parseMetric(metricInput) ?? "Overall";
  const limit = limitInput && limitInput > 0 ? limitInput : 5;

  const players = await PlayerRepository.findAllPlayers();
  const topPlayers = [...players]
    .sort((left, right) => right.statistics[metric] - left.statistics[metric])
    .slice(0, limit)
    .map((player) => ({
      id: player.id,
      name: player.name,
      club: player.club,
      metric,
      score: player.statistics[metric],
    }));

  if (topPlayers.length === 0) {
    return HttpResponse.noContent();
  }

  return HttpResponse.ok(topPlayers);
};

export const getPlayersSummaryService = async () => {
  const players = await PlayerRepository.findAllPlayers();

  if (players.length === 0) {
    return HttpResponse.noContent();
  }

  const summary = statsKeys.reduce(
    (accumulator, key) => {
      const total = players.reduce((sum, player) => {
        return sum + player.statistics[key];
      }, 0);

      accumulator[key] = Number((total / players.length).toFixed(2));
      return accumulator;
    },
    {} as Record<StatsMetric, number>
  );

  const clubs = new Set(players.map((player) => player.club));
  const nationalities = new Set(players.map((player) => player.nationality));

  return HttpResponse.ok({
    totalPlayers: players.length,
    uniqueClubs: clubs.size,
    uniqueNationalities: nationalities.size,
    averageStatistics: summary,
  });
};
