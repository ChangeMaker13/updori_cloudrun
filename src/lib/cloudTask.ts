import express, { NextFunction, Request, Response } from "express";
import { Server } from "node:http";
import { AddressInfo } from "node:net";
import process from "node:process";
import admin from "firebase-admin";

import { CloudTasksClient } from "@google-cloud/tasks";
import { mylog } from "./logger.js";

const project = "updori-ebacb";
const queue = "sellsettingqueue2";
const location = "asia-northeast3";
const cloudRunDomain = "https://updori-528826945726.asia-northeast3.run.app";

export async function makeTask(funcName: string, afterSeconds: string, payload: string) : Promise<string> {
  // Task 클라이언트 초기화
  const client = new CloudTasksClient();

  // Queue 경로 설정
  const parent = client.queuePath(project, location, queue);
  const funcURL = `${cloudRunDomain}/${funcName}`;

  // Task 생성
  const task = {
    httpRequest: {
      httpMethod: "POST" as const,
      url: funcURL,
      //oidcToken: {
      //  serviceAccountEmail: serviceAccount.client_email,
      //  audience: funcURL,
      //},
      headers: {
        "Content-Type": "application/json",
      },
      body: Buffer.from(payload).toString("base64"),
    },
    scheduleTime: {
      seconds: Date.now() / 1000 + parseInt(afterSeconds),
    },
  };

  let response;

  try {
    response = await client.createTask({ parent, task });
    //console.log(`Task ${response[0].name} created.`);
    mylog(`Task ${response[0].name} created.`, "production");
    return response[0].name?.split("/").pop() ?? "";
  } catch (err) {
    mylog(`Error creating task: ${err}`, "production");
    throw new Error("Failed to create task");
  }
}

export async function deleteTask(taskId: string) {
  const client = new CloudTasksClient();

  try {
    const parent = client.taskPath(project, location, queue, taskId);
    await client.getTask({ name: parent });
    await client.deleteTask({ name: parent });
    mylog(`Task ${taskId} deleted.`, "production");
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error.code === 7 || error.code === 5)) { // NOT_FOUND
      //console.log(`Task ${taskId} not found`);
      return;
    }
    mylog(`Error deleting task ${taskId}: ${error}`, "production");
    throw error;
  }
}

