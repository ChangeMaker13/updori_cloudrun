import express, { NextFunction, Request, Response } from "express";
import { Server } from "node:http";
import { AddressInfo } from "node:net";
import process from "node:process";
import admin from "firebase-admin";

import { CloudTasksClient } from "@google-cloud/tasks";

const project = "updori-ebacb";
const queue = "sellsettingqueue";
const location = "asia-northeast3";
const cloudRunDomain = "https://updori-528826945726.asia-northeast3.run.app";

export async function makeTask(serviceAccount: any, funcName: string, afterSeconds: string, payload: string) {
  //console.log(funcName, afterSeconds, payload);

  //console.log(serviceAccount);

  // Task 클라이언트 초기화
  const client = new CloudTasksClient({
    credentials: serviceAccount,
    projectId: project,
  });

  // Queue 경로 설정
  const parent = client.queuePath(project, location, queue);
  //console.log("Queue 경로:", parent);

  const funcURL = `${cloudRunDomain}/${funcName}`; 
  //const email = `${project}@appspot.gserviceaccount.com`;

  //console.log(funcURL);

  // Task 생성
  const task = {
    httpRequest: {
      httpMethod: "POST" as const,
      url: funcURL,
      oidcToken: {
        serviceAccountEmail: serviceAccount.client_email,
        audience: funcURL,
      },
      headers: {
        "Content-Type": "application/json",
      },
      body: Buffer.from(payload).toString("base64"),
    },
    scheduleTime: {
      seconds: Date.now() / 1000 + parseInt(afterSeconds),
    },
  };

  //console.log(task);

  let response;
  try {
    response = await client.createTask({ parent, task });
    console.log(`response : ${JSON.stringify(response)}`);
    console.log(`Task ${response[0].name} created.`);
  } catch (err) {
    console.error("Error creating task:", err);
    throw new Error("Failed to create task");
  }
}
