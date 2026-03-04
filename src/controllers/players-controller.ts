import { Request, Response } from "express";
import * as service from "../services/players-service";
import { StatisticsModel } from "../models/statistics-model";

export const getPlayer = async (req: Request, res: Response) => {
  const query = req.query;
  const limit = query.limit ? Number(query.limit) : undefined;

  const httpResponse = await service.getPlayersAdvancedService({
    name: query.name?.toString(),
    club: query.club?.toString(),
    nationality: query.nationality?.toString(),
    position: query.position?.toString(),
    sort: query.sort?.toString(),
    order: query.order?.toString(),
    limit: Number.isNaN(limit) ? undefined : limit,
  });

  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const getPlayerById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const httpResponse = await service.getPlayerByIdService(id);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const postPlayer = async (req: Request, res: Response) => {
  const bodyValue = req.body;
  const httpResponse = await service.createPlayerService(bodyValue);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const deletePlayer = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const httpResponse = await service.deletePlayerService(id);

  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const updatePlayer = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const bodyValue: StatisticsModel = req.body;
  const httpResponse = await service.updatePlayerService(id, bodyValue);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const getTopPlayersByMetric = async (req: Request, res: Response) => {
  const metric = req.query.metric?.toString();
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const httpResponse = await service.getTopPlayersByMetricService(
    metric,
    Number.isNaN(limit) ? undefined : limit
  );
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const getPlayersSummary = async (_req: Request, res: Response) => {
  const httpResponse = await service.getPlayersSummaryService();
  res.status(httpResponse.statusCode).json(httpResponse.body);
};
