# MASTER PROMPT — Üzleti igény és kontextus (node-ts)

## Role
You are a principal full-stack engineer and zero-regression delivery lead acting as one elite implementation agent.

## Goal
Recreate the complete application below in the "TypeScript / Node (Express + SQLite adatbázis + statikus frontend)" stack so that it COMPILES, STARTS locally (prints "listening on <PORT>", PORT from env), and passes the HTTP QA checks in 99_validation.

## Üzleti igény (eredeti brief — teljes)

﻿
include all the supporing commands from the files below:
"C:\Work\Homemeter\FORGE" usage instruction: "C:\Work\Homemeter\FORGE\README.md"
Supportive file to prevent from errors: 
"C:\Work\Homemeter\codingLessonsLearnt.md"




Expanded brief
Product Title
Industrial Maintenance Command Center

Product Type
Cross-platform desktop application for Windows and macOS, optimized for large monitors, multi-pane workflows, high-density operational dashboards, and keyboard-first operator usage. A korszerű maintenance platformoknál a valós idejű work order követés, asset adatok, inventory és döntéstámogatás egy közös operatív nézetben jelenik meg, ezért a desktop fókusz itt kifejezetten indokolt.

Product Vision
Build a premium industrial maintenance desktop command system that becomes the operational nerve center of a factory, plant, warehouse, utility site, or large industrial campus. The software must enable operators, shift leads, maintenance technicians, supervisors, planners, and inventory coordinators to detect issues earlier, prioritize interventions faster, reduce downtime, coordinate actions across teams, and preserve institutional maintenance knowledge in a structured, searchable, auditable form. A fejlett maintenance rendszerek fő értéke, hogy a hibajegyeket, eszköztörténetet, alkatrészeket és beavatkozási adatokat egységesen kezelik, ami csökkenti az információs széttagoltságot és javítja a reakcióidőt.

Primary Goal
Create a high-information-density desktop environment where the user can immediately understand:

what is failing now,

what is at risk of failing next,

what requires immediate intervention,

what is blocked by parts, approvals, or safety constraints,

what is overdue,

who is responsible,

what happened previously on the same asset,

and what action should be taken next.

A maintenance dashboardok tervezésénél a legfontosabb elv, hogy a KPI-ok és az operatív adatok közvetlenül a csapat céljaihoz és reakcióidejéhez igazodjanak, ne csak statikus riportként jelenjenek meg.

Core concept
The application is not just a CMMS work order list. It is a live operational command center designed for active industrial use during real shifts, incidents, escalations, preventive maintenance windows, and multi-team coordination. The product must combine the strengths of:

a real-time equipment monitoring dashboard,

a work order and incident management system,

a spare parts and inventory control interface,

a maintenance history explorer,

a shift handover console,

an escalation and SLA tracking board,

and an operator-grade decision support surface.

A korszerű CMMS rendszerek tipikusan egyszerre fedik le a work order managementet, preventive maintenance-et, asset trackinget, inventory kezelést és reportingot; ettől lesznek valóban napi használatú operatív rendszerek.

Users and roles
The system must support multiple role-specific experiences, not just role-based hidden buttons.

Core user roles
Operator – sees live machine state, active alerts, open incidents, simple acknowledgement actions, and escalation triggers.

Technician – sees assigned jobs, nearby work orders, machine details, maintenance instructions, checklists, attachments, tools, and parts availability.

Supervisor / Shift Lead – sees the plant-wide operational picture, staffing readiness, SLA risk, overdue interventions, blocked work, escalation queues, and cross-team workload.

Maintenance Planner – sees future workload, preventive maintenance schedule, recurring jobs, resource conflicts, shutdown windows, and capacity bottlenecks.

Inventory Manager – sees spare part levels, reservations, shortages, substitutions, lead times, movement logs, and critical stock alerts.

Reliability / Process Engineer – sees failure patterns, root cause clusters, MTTR/MTBF trends, recurring machine issues, intervention quality, and improvement opportunities.

Admin – configures sites, plants, lines, assets, workflows, permissions, statuses, code tables, integrations, retention rules, and notification policies.

A maintenance rendszerekben a külön szerepkörök eltérő jogosultságokat és eltérő operatív nézeteket kapnak, mert a technikus, supervisor és inventory felhasználó más döntéseket hoz ugyanabból az adathalmazból.

Role design principle
Each role should get:

a different home screen emphasis,

different KPI priorities,

different default panels,

different shortcut presets,

and different action permissions.

This must feel like one system with multiple operational perspectives, not one generic dashboard with filtered widgets.

Product outcomes
The software should measurably improve:

response time to faults,

time-to-assignment,

time-to-first-action,

spare part readiness,

maintenance throughput,

SLA compliance,

auditability,

shift handover quality,

technician productivity,

asset uptime,

and root cause learning.

A maintenance platformok elsődleges üzleti előnye a downtime csökkentése, a karbantartási hatékonyság javítása és az eszközelérhetőség növelése.

Platform and environment
Application format
Native-feeling desktop software for Windows and macOS.

Usage context
Large screens in control rooms.

Engineering stations on factory floors.

Shared workstations in maintenance offices.

Supervisor monitors in production command rooms.

Technician laptops in workshops.

Potential kiosk-style overview mode on wall displays.

Operational constraints
Must perform well in information-dense layouts.

Must support keyboard-heavy workflows.

Must support occasional offline or degraded-network usage.

Must maintain data integrity during sync recovery.

Must remain usable in noisy, high-stress, shift-based industrial environments.

A valós idejű maintenance dashboardok értéke pont abban áll, hogy a work order és asset adatok folyamatosan követhetők, ezért a hálózati és operációs megbízhatóság a termék alapkövetelménye.

Product pillars
1. Real-time operational awareness
The interface must continuously surface the current health of the plant, machines, lines, cells, or equipment groups with minimal interaction required from the user. A real-time tracking dashboard célja, hogy a karbantartás ne „black box” legyen, hanem folyamatosan látható és optimalizálható folyamat.

2. Action-first design
The software must never stop at showing information. Every critical status should suggest or enable an action: assign, escalate, acknowledge, dispatch, reserve part, request approval, attach photo, create follow-up task, or open root cause analysis.

3. Maintenance coordination
The product must help teams coordinate across shifts, roles, asset groups, and maintenance types: corrective, preventive, predictive, inspection, shutdown, emergency, and follow-up.

4. Asset intelligence
Each machine or asset should accumulate meaningful operational memory: faults, interventions, repeated failures, technician notes, downtime impact, safety restrictions, replacement history, and parts consumption.

5. Inventory linkage
The spare parts layer must not be a separate forgotten module. Part availability must directly affect work order readiness, intervention planning, and escalation logic. A spare parts management a CMMS egyik kulcseleme, mert közvetlenül befolyásolja a beavatkozási sebességet és az eszközök rendelkezésre állását.

6. Auditability and accountability
Every change, assignment, comment, movement, override, and escalation must be tracked.

Information architecture
The application should be designed around a multi-pane command center layout rather than a mobile-style single-column flow.

Suggested main desktop structure
Left panel – live operational rail
Persistent navigational and monitoring surface containing:

site / plant / line hierarchy,

live equipment tree,

status clusters,

active incident list,

filtering chips,

saved views,

pinned assets,

critical alert stack,

shift summary strip.

Center panel – primary operational workspace
Changes contextually depending on selected entity:

machine overview,

work order board,

timeline,

status matrix,

recent failures,

intervention details,

diagnostics,

procedures,

charts,

attached evidence,

maintenance runbook.

Right panel – action and intelligence sidebar
Contains:

actions,

assignment controls,

escalation controls,

notes,

approval requests,

risk warnings,

required tools,

required permits,

required spare parts,

SLA countdown,

blocker reasons,

related records,

quick communication actions.

This kind of central, data-dense overview is aligned with maintenance dashboard best practice, where multiple data sources and operational KPIs are combined into a single decision surface.

Optional top bar
global search,

command palette,

shift selector,

plant selector,

notification center,

sync state,

user role switcher for admin/testing,

alarm summary,

current time and shift phase.

Optional bottom utility strip
connectivity state,

sync queue,

import/export jobs,

system events,

keyboard shortcut hint,

unresolved conflict indicator.

Functional modules
1. Asset and equipment monitoring
The software must support live visibility into:

machine states,

alarms,

warning levels,

operating status,

downtime state,

idle state,

maintenance mode,

lockout/tagout state,

sensor-derived health indicators,

threshold breaches,

abnormal patterns.

Each asset card or machine profile should show:

current status,

criticality,

location,

owner team,

last intervention,

next planned maintenance,

open incidents,

related parts,

downtime cost estimate,

reliability score,

and recent event stream.

A maintenance platform jellemzően egy helyen gyűjti az asset információkat, work orderöket és teljesítményadatokat, hogy az eszközök rendelkezésre állása javuljon.

2. Work order and incident management
The system must handle:

corrective work orders,

emergency interventions,

preventive tasks,

inspection tasks,

follow-up tasks,

safety checks,

deferred tasks,

approval-dependent tasks,

and recurring maintenance plans.

Each work order should support:

unique ID,

asset linkage,

problem category,

severity,

maintenance type,

production impact,

safety impact,

downtime impact,

root cause status,

assignee,

team,

due time,

SLA timer,

blocker flags,

permits,

checklists,

time spent,

parts used,

attachments,

resolution notes,

sign-off state.

A work order management a CMMS egyik alapfunkciója, amely a feladatok létrehozását, kiosztását, priorizálását és nyomon követését biztosítja.

3. Assignment and escalation engine
The application must support:

manual task assignment,

skill-based assignment suggestions,

role-based escalation paths,

shift-based ownership,

reassignment history,

overdue escalation,

standby technician routing,

approval workflows,

command-center override,

emergency escalation ladders.

Priority must not be a simple low-medium-high badge. It should be a composite logic derived from:

asset criticality,

production impact,

safety exposure,

downtime duration,

SLA remaining time,

parts readiness,

recurrence pattern,

and current staffing availability.

4. Preventive and planned maintenance
The system must support recurring maintenance scheduling, shutdown planning, inspection cycles, maintenance calendars, planning conflicts, and capacity balancing. Preventive maintenance scheduling a fejlett maintenance rendszerek központi eleme, nem csak az unplanned hibák kezelése.

5. Spare parts and inventory management
The application must include:

spare part master data,

criticality category,

stock on hand,

reserved quantity,

available quantity,

reorder points,

min/max thresholds,

preferred substitutes,

compatible assets,

supplier references,

lead times,

movement history,

issue and return transactions,

consumption analytics,

stockout risks.

Inventory availability should directly appear inside work orders, asset profiles, and escalation logic. A spare parts készlet felügyelete közvetlenül hozzájárul a maintenance hatékonysághoz és az equipment availabilityhez.

6. Maintenance history and institutional memory
Each asset must maintain a rich longitudinal history:

previous incidents,

previous work orders,

repeated failures,

parts replacement record,

technician observations,

mean repair time,

downtime trends,

maintenance cost history,

intervention quality markers,

and unresolved recurring symptoms.

The app should help teams not only resolve issues, but learn from them.

7. Root cause analysis and failure intelligence
Include structured RCA support:

symptom,

likely cause,

actual cause,

contributing factors,

environmental factors,

repeatability,

corrective action,

preventive action,

verification step,

engineering review,

knowledge capture.

The system should surface patterns like:

repeated same-cause failures,

same-part repeated replacement,

recurring technician notes,

chronic borderline SLA cases,

assets with high intervention frequency but low closure quality.

MaintainX például kifejezetten kiemeli az AI-támogatott troubleshootingot és a work historyből épített ajánlásokat, ami azt mutatja, hogy a maintenance tudás újrahasznosítása ma már versenyelőny.

8. Shift handover and operations continuity
The system must support formalized handover between shifts:

unresolved issues,

watchlist assets,

risky machines,

in-progress interventions,

pending approvals,

blocked work,

reserved parts,

expected morning actions,

supervisor notes,

highlighted exceptions.

Shift handover should be a first-class workflow, not just a comment box.

9. Attachments and evidence
Users must be able to attach:

photos,

machine screenshots,

vibration reports,

thermal images,

manuals,

maintenance PDFs,

vendor documents,

permits,

drawings,

SOPs,

safety checklists,

inspection sheets.

Attachments should be previewable, searchable by metadata, and linked to asset, task, and incident entities.

10. SLA and response control
The software must make SLA pressure visible at all times:

countdown timers,

breach prediction,

overdue work highlighting,

team load impact,

blocked-by-part visibility,

blocked-by-approval visibility,

breach reason tracking,

post-breach review.

SLA tracking and overdue visibility are common core requirements in work-order-centered maintenance operations because they link service quality to operational execution.

11. Analytics and reporting
The product must include a chart-heavy analytics area with:

MTTR,

MTBF,

downtime by line,

downtime by asset class,

intervention count,

repeated fault categories,

overdue rate,

technician workload,

resolution time distribution,

first-time-fix rate,

spare part consumption,

stockout frequency,

backlog trend,

compliance trend,

intervention age buckets.

Maintenance dashboard kialakításnál a releváns KPI-ok és a megfelelő adatforrások kiválasztása kulcskérdés.

12. Audit trail and compliance
Every sensitive action must be logged:

creation,

edit,

delete,

assignment,

priority change,

status change,

escalation,

stock movement,

attachment upload,

approval,

override,

closure,

reopen,

export.

This is especially important in industrial and regulated contexts.

UX and design direction
Design character
The visual language should feel:

industrial,

precise,

premium,

calm under pressure,

information-dense,

high-contrast,

reliable,

serious,

and operationally focused.

It should not feel like:

a generic startup dashboard,

a mobile app stretched onto desktop,

a playful SaaS admin template,

or a consumer productivity tool.

Visual principles
Strong hierarchy.

Dense but legible layouts.

Fast scannability.

Clear danger / warning / blocked / pending / healthy states.

Minimal but meaningful color usage.

Consistent semantic color system.

Low-animation environment.

Clear panel separation.

No visual clutter.

Theme support
dark mode optimized for control-room usage,

light mode for office/admin usage,

operator-friendly contrast ratios,

strong readability from distance.

Interaction model
keyboard-first,

command palette,

hotkeys for assignment/escalation/filtering,

drag-and-drop reprioritization,

bulk actions,

fast table navigation,

quick preview panels,

zero-friction context switching.

A desktop-oriented, data-dense maintenance környezetben a gyors keresés, a táblázatos áttekintés és a valós idejű frissítés erősíti az operátori hatékonyságot.

Screen ecosystem
The product should contain at minimum:

Global Command Center

Asset Explorer

Work Order Board

Incident Feed

Shift Handover View

Maintenance Timeline

Inventory & Spare Parts Console

Technician Queue

Supervisor Escalation Board

Reliability Analytics Dashboard

Audit & Event Log

Attachment Library

User / Role Administration

Integration & Sync Monitor

Plant / Site Configuration

Each screen should have a distinct purpose and should support both detail work and operational scanning.

Data model expectations
The domain model should include at minimum:

Site

Plant

Area

Line

Cell

Asset

Asset Type

Asset Criticality

Sensor Feed

Status Event

Alarm

Work Order

Work Order Type

Incident

Checklist

Task

Maintenance Plan

Shift

Handover

User

Role

Team

Skill

Assignment

Escalation

Part

Inventory Location

Stock Movement

Supplier

Attachment

Comment

Audit Event

SLA Rule

Root Cause Record

Downtime Event

Approval

Notification

Knowledge Article

Integrations
The desktop app should be designed to integrate with:

PLC / SCADA / OPC-UA data sources,

ERP systems,

inventory systems,

supplier databases,

sensor and condition-monitoring platforms,

MES systems,

email / notifications,

SSO / enterprise identity,

document storage,

barcode / QR scanning layers,

and future mobile technician workflows.

A modern CMMS platformok valós idejű adatcserével csatlakoznak ERP, BMS, SCADA és más rendszerekhez, hogy megszűnjenek az adatsilók.

Reliability and non-functional requirements
The application should prioritize:

fast launch time,

robust multi-window behavior,

low-latency interactions,

real-time sync,

offline-ready caching,

sync conflict management,

crash recovery,

audit-safe writes,

secure attachment handling,

strong permissions,

enterprise-grade search,

and resilient desktop performance under high data load.

What “great” looks like
A truly excellent version of this software should make a supervisor feel that the plant is under control within seconds of opening the app. A good maintenance system centralizes work orders, asset data, inventory, analytics, and operational visibility; a great one also tells the team what matters now, what is drifting toward failure, what is blocked, and what to do next.

It should feel like a command bridge for industrial maintenance rather than an admin panel. It should support pressure, urgency, and accountability without becoming visually overwhelming. High-performing maintenance software succeeds when it turns fragmented maintenance data into coordinated operational action.Persze — az alábbi verzió egy jóval komolyabb, termékstratégiai és UX szinten is erősebb brief, amely már nem csak feature-lista, hanem valódi desktop product brief / product vision / functional scope / UX direction / information architecture / operational logic dokumentumként használható. A modern CMMS/EAM rendszerek jellemzően a work order managementet, asset historyt, spare parts inventoryt, real-time monitoringot, audit trailt és integrációkat egyetlen központi rendszerben kezelik, ezért ezt a kibővített briefet is ilyen szemlélettel érdemes megfogalmazni.

Expanded brief
Product Title
Industrial Maintenance Command Center

Product Type
Cross-platform desktop application for Windows and macOS, optimized for large monitors, multi-pane workflows, high-density operational dashboards, and keyboard-first operator usage. A korszerű maintenance platformoknál a valós idejű work order követés, asset adatok, inventory és döntéstámogatás egy közös operatív nézetben jelenik meg, ezért a desktop fókusz itt kifejezetten indokolt.

Product Vision
Build a premium industrial maintenance desktop command system that becomes the operational nerve center of a factory, plant, warehouse, utility site, or large industrial campus. The software must enable operators, shift leads, maintenance technicians, supervisors, planners, and inventory coordinators to detect issues earlier, prioritize interventions faster, reduce downtime, coordinate actions across teams, and preserve institutional maintenance knowledge in a structured, searchable, auditable form. A fejlett maintenance rendszerek fő értéke, hogy a hibajegyeket, eszköztörténetet, alkatrészeket és beavatkozási adatokat egységesen kezelik, ami csökkenti az információs széttagoltságot és javítja a reakcióidőt.

Primary Goal
Create a high-information-density desktop environment where the user can immediately understand:

what is failing now,

what is at risk of failing next,

what requires immediate intervention,

what is blocked by parts, approvals, or safety constraints,

what is overdue,

who is responsible,

what happened previously on the same asset,

and what action should be taken next.

A maintenance dashboardok tervezésénél a legfontosabb elv, hogy a KPI-ok és az operatív adatok közvetlenül a csapat céljaihoz és reakcióidejéhez igazodjanak, ne csak statikus riportként jelenjenek meg.

Core concept
The application is not just a CMMS work order list. It is a live operational command center designed for active industrial use during real shifts, incidents, escalations, preventive maintenance windows, and multi-team coordination. The product must combine the strengths of:

a real-time equipment monitoring dashboard,

a work order and incident management system,

a spare parts and inventory control interface,

a maintenance history explorer,

a shift handover console,

an escalation and SLA tracking board,

and an operator-grade decision support surface.

A korszerű CMMS rendszerek tipikusan egyszerre fedik le a work order managementet, preventive maintenance-et, asset trackinget, inventory kezelést és reportingot; ettől lesznek valóban napi használatú operatív rendszerek.

Users and roles
The system must support multiple role-specific experiences, not just role-based hidden buttons.

Core user roles
Operator – sees live machine state, active alerts, open incidents, simple acknowledgement actions, and escalation triggers.

Technician – sees assigned jobs, nearby work orders, machine details, maintenance instructions, checklists, attachments, tools, and parts availability.

Supervisor / Shift Lead – sees the plant-wide operational picture, staffing readiness, SLA risk, overdue interventions, blocked work, escalation queues, and cross-team workload.

Maintenance Planner – sees future workload, preventive maintenance schedule, recurring jobs, resource conflicts, shutdown windows, and capacity bottlenecks.

Inventory Manager – sees spare part levels, reservations, shortages, substitutions, lead times, movement logs, and critical stock alerts.

Reliability / Process Engineer – sees failure patterns, root cause clusters, MTTR/MTBF trends, recurring machine issues, intervention quality, and improvement opportunities.

Admin – configures sites, plants, lines, assets, workflows, permissions, statuses, code tables, integrations, retention rules, and notification policies.

A maintenance rendszerekben a külön szerepkörök eltérő jogosultságokat és eltérő operatív nézeteket kapnak, mert a technikus, supervisor és inventory felhasználó más döntéseket hoz ugyanabból az adathalmazból.

Role design principle
Each role should get:

a different home screen emphasis,

different KPI priorities,

different default panels,

different shortcut presets,

and different action permissions.

This must feel like one system with multiple operational perspectives, not one generic dashboard with filtered widgets.

Product outcomes
The software should measurably improve:

response time to faults,

time-to-assignment,

time-to-first-action,

spare part readiness,

maintenance throughput,

SLA compliance,

auditability,

shift handover quality,

technician productivity,

asset uptime,

and root cause learning.

A maintenance platformok elsődleges üzleti előnye a downtime csökkentése, a karbantartási hatékonyság javítása és az eszközelérhetőség növelése.

Platform and environment
Application format
Native-feeling desktop software for Windows and macOS.

Usage context
Large screens in control rooms.

Engineering stations on factory floors.

Shared workstations in maintenance offices.

Supervisor monitors in production command rooms.

Technician laptops in workshops.

Potential kiosk-style overview mode on wall displays.

Operational constraints
Must perform well in information-dense layouts.

Must support keyboard-heavy workflows.

Must support occasional offline or degraded-network usage.

Must maintain data integrity during sync recovery.

Must remain usable in noisy, high-stress, shift-based industrial environments.

A valós idejű maintenance dashboardok értéke pont abban áll, hogy a work order és asset adatok folyamatosan követhetők, ezért a hálózati és operációs megbízhatóság a termék alapkövetelménye.

Product pillars
1. Real-time operational awareness
The interface must continuously surface the current health of the plant, machines, lines, cells, or equipment groups with minimal interaction required from the user. A real-time tracking dashboard célja, hogy a karbantartás ne „black box” legyen, hanem folyamatosan látható és optimalizálható folyamat.

2. Action-first design
The software must never stop at showing information. Every critical status should suggest or enable an action: assign, escalate, acknowledge, dispatch, reserve part, request approval, attach photo, create follow-up task, or open root cause analysis.

3. Maintenance coordination
The product must help teams coordinate across shifts, roles, asset groups, and maintenance types: corrective, preventive, predictive, inspection, shutdown, emergency, and follow-up.

4. Asset intelligence
Each machine or asset should accumulate meaningful operational memory: faults, interventions, repeated failures, technician notes, downtime impact, safety restrictions, replacement history, and parts consumption.

5. Inventory linkage
The spare parts layer must not be a separate forgotten module. Part availability must directly affect work order readiness, intervention planning, and escalation logic. A spare parts management a CMMS egyik kulcseleme, mert közvetlenül befolyásolja a beavatkozási sebességet és az eszközök rendelkezésre állását.

6. Auditability and accountability
Every change, assignment, comment, movement, override, and escalation must be tracked.

Information architecture
The application should be designed around a multi-pane command center layout rather than a mobile-style single-column flow.

Suggested main desktop structure
Left panel – live operational rail
Persistent navigational and monitoring surface containing:

site / plant / line hierarchy,

live equipment tree,

status clusters,

active incident list,

filtering chips,

saved views,

pinned assets,

critical alert stack,

shift summary strip.

Center panel – primary operational workspace
Changes contextually depending on selected entity:

machine overview,

work order board,

timeline,

status matrix,

recent failures,

intervention details,

diagnostics,

procedures,

charts,

attached evidence,

maintenance runbook.

Right panel – action and intelligence sidebar
Contains:

actions,

assignment controls,

escalation controls,

notes,

approval requests,

risk warnings,

required tools,

required permits,

required spare parts,

SLA countdown,

blocker reasons,

related records,

quick communication actions.

This kind of central, data-dense overview is aligned with maintenance dashboard best practice, where multiple data sources and operational KPIs are combined into a single decision surface.

Optional top bar
global search,

command palette,

shift selector,

plant selector,

notification center,

sync state,

user role switcher for admin/testing,

alarm summary,

current time and shift phase.

Optional bottom utility strip
connectivity state,

sync queue,

import/export jobs,

system events,

keyboard shortcut hint,

unresolved conflict indicator.

Functional modules
1. Asset and equipment monitoring
The software must support live visibility into:

machine states,

alarms,

warning levels,

operating status,

downtime state,

idle state,

maintenance mode,

lockout/tagout state,

sensor-derived health indicators,

threshold breaches,

abnormal patterns.

Each asset card or machine profile should show:

current status,

criticality,

location,

owner team,

last intervention,

next planned maintenance,

open incidents,

related parts,

downtime cost estimate,

reliability score,

and recent event stream.

A maintenance platform jellemzően egy helyen gyűjti az asset információkat, work orderöket és teljesítményadatokat, hogy az eszközök rendelkezésre állása javuljon.

2. Work order and incident management
The system must handle:

corrective work orders,

emergency interventions,

preventive tasks,

inspection tasks,

follow-up tasks,

safety checks,

deferred tasks,

approval-dependent tasks,

and recurring maintenance plans.

Each work order should support:

unique ID,

asset linkage,

problem category,

severity,

maintenance type,

production impact,

safety impact,

downtime impact,

root cause status,

assignee,

team,

due time,

SLA timer,

blocker flags,

permits,

checklists,

time spent,

parts used,

attachments,

resolution notes,

sign-off state.

A work order management a CMMS egyik alapfunkciója, amely a feladatok létrehozását, kiosztását, priorizálását és nyomon követését biztosítja.

3. Assignment and escalation engine
The application must support:

manual task assignment,

skill-based assignment suggestions,

role-based escalation paths,

shift-based ownership,

reassignment history,

overdue escalation,

standby technician routing,

approval workflows,

command-center override,

emergency escalation ladders.

Priority must not be a simple low-medium-high badge. It should be a composite logic derived from:

asset criticality,

production impact,

safety exposure,

downtime duration,

SLA remaining time,

parts readiness,

recurrence pattern,

and current staffing availability.

4. Preventive and planned maintenance
The system must support recurring maintenance scheduling, shutdown planning, inspection cycles, maintenance calendars, planning conflicts, and capacity balancing. Preventive maintenance scheduling a fejlett maintenance rendszerek központi eleme, nem csak az unplanned hibák kezelése.

5. Spare parts and inventory management
The application must include:

spare part master data,

criticality category,

stock on hand,

reserved quantity,

available quantity,

reorder points,

min/max thresholds,

preferred substitutes,

compatible assets,

supplier references,

lead times,

movement history,

issue and return transactions,

consumption analytics,

stockout risks.

Inventory availability should directly appear inside work orders, asset profiles, and escalation logic. A spare parts készlet felügyelete közvetlenül hozzájárul a maintenance hatékonysághoz és az equipment availabilityhez.

6. Maintenance history and institutional memory
Each asset must maintain a rich longitudinal history:

previous incidents,

previous work orders,

repeated failures,

parts replacement record,

technician observations,

mean repair time,

downtime trends,

maintenance cost history,

intervention quality markers,

and unresolved recurring symptoms.

The app should help teams not only resolve issues, but learn from them.

7. Root cause analysis and failure intelligence
Include structured RCA support:

symptom,

likely cause,

actual cause,

contributing factors,

environmental factors,

repeatability,

corrective action,

preventive action,

verification step,

engineering review,

knowledge capture.

The system should surface patterns like:

repeated same-cause failures,

same-part repeated replacement,

recurring technician notes,

chronic borderline SLA cases,

assets with high intervention frequency but low closure quality.

MaintainX például kifejezetten kiemeli az AI-támogatott troubleshootingot és a work historyből épített ajánlásokat, ami azt mutatja, hogy a maintenance tudás újrahasznosítása ma már versenyelőny.

8. Shift handover and operations continuity
The system must support formalized handover between shifts:

unresolved issues,

watchlist assets,

risky machines,

in-progress interventions,

pending approvals,

blocked work,

reserved parts,

expected morning actions,

supervisor notes,

highlighted exceptions.

Shift handover should be a first-class workflow, not just a comment box.

9. Attachments and evidence
Users must be able to attach:

photos,

machine screenshots,

vibration reports,

thermal images,

manuals,

maintenance PDFs,

vendor documents,

permits,

drawings,

SOPs,

safety checklists,

inspection sheets.

Attachments should be previewable, searchable by metadata, and linked to asset, task, and incident entities.

10. SLA and response control
The software must make SLA pressure visible at all times:

countdown timers,

breach prediction,

overdue work highlighting,

team load impact,

blocked-by-part visibility,

blocked-by-approval visibility,

breach reason tracking,

post-breach review.

SLA tracking and overdue visibility are common core requirements in work-order-centered maintenance operations because they link service quality to operational execution.

11. Analytics and reporting
The product must include a chart-heavy analytics area with:

MTTR,

MTBF,

downtime by line,

downtime by asset class,

intervention count,

repeated fault categories,

overdue rate,

technician workload,

resolution time distribution,

first-time-fix rate,

spare part consumption,

stockout frequency,

backlog trend,

compliance trend,

intervention age buckets.

Maintenance dashboard kialakításnál a releváns KPI-ok és a megfelelő adatforrások kiválasztása kulcskérdés.

12. Audit trail and compliance
Every sensitive action must be logged:

creation,

edit,

delete,

assignment,

priority change,

status change,

escalation,

stock movement,

attachment upload,

approval,

override,

closure,

reopen,

export.

This is especially important in industrial and regulated contexts.

UX and design direction
Design character
The visual language should feel:

industrial,

precise,

premium,

calm under pressure,

information-dense,

high-contrast,

reliable,

serious,

and operationally focused.

It should not feel like:

a generic startup dashboard,

a mobile app stretched onto desktop,

a playful SaaS admin template,

or a consumer productivity tool.

Visual principles
Strong hierarchy.

Dense but legible layouts.

Fast scannability.

Clear danger / warning / blocked / pending / healthy states.

Minimal but meaningful color usage.

Consistent semantic color system.

Low-animation environment.

Clear panel separation.

No visual clutter.

Theme support
dark mode optimized for control-room usage,

light mode for office/admin usage,

operator-friendly contrast ratios,

strong readability from distance.

Interaction model
keyboard-first,

command palette,

hotkeys for assignment/escalation/filtering,

drag-and-drop reprioritization,

bulk actions,

fast table navigation,

quick preview panels,

zero-friction context switching.

A desktop-oriented, data-dense maintenance környezetben a gyors keresés, a táblázatos áttekintés és a valós idejű frissítés erősíti az operátori hatékonyságot.

Screen ecosystem
The product should contain at minimum:

Global Command Center

Asset Explorer

Work Order Board

Incident Feed

Shift Handover View

Maintenance Timeline

Inventory & Spare Parts Console

Technician Queue

Supervisor Escalation Board

Reliability Analytics Dashboard

Audit & Event Log

Attachment Library

User / Role Administration

Integration & Sync Monitor

Plant / Site Configuration

Each screen should have a distinct purpose and should support both detail work and operational scanning.

Data model expectations
The domain model should include at minimum:

Site

Plant

Area

Line

Cell

Asset

Asset Type

Asset Criticality

Sensor Feed

Status Event

Alarm

Work Order

Work Order Type

Incident

Checklist

Task

Maintenance Plan

Shift

Handover

User

Role

Team

Skill

Assignment

Escalation

Part

Inventory Location

Stock Movement

Supplier

Attachment

Comment

Audit Event

SLA Rule

Root Cause Record

Downtime Event

Approval

Notification

Knowledge Article

Integrations
The desktop app should be designed to integrate with:

PLC / SCADA / OPC-UA data sources,

ERP systems,

inventory systems,

supplier databases,

sensor and condition-monitoring platforms,

MES systems,

email / notifications,

SSO / enterprise identity,

document storage,

barcode / QR scanning layers,

and future mobile technician workflows.

A modern CMMS platformok valós idejű adatcserével csatlakoznak ERP, BMS, SCADA és más rendszerekhez, hogy megszűnjenek az adatsilók.

Reliability and non-functional requirements
The application should prioritize:

fast launch time,

robust multi-window behavior,

low-latency interactions,

real-time sync,

offline-ready caching,

sync conflict management,

crash recovery,

audit-safe writes,

secure attachment handling,

strong permissions,

enterprise-grade search,

and resilient desktop performance under high data load.

What “great” looks like
A truly excellent version of this software should make a supervisor feel that the plant is under control within seconds of opening the app. A good maintenance system centralizes work orders, asset data, inventory, analytics, and operational visibility; a great one also tells the team what matters now, what is drifting toward failure, what is blocked, and what to do next.

It should feel like a command bridge for industrial maintenance rather than an admin panel. It should support pressure, urgency, and accountability without becoming visually overwhelming. High-performing maintenance software succeeds when it turns fragmented maintenance data into coordinated operational action.Téma: Industrial Maintenance Command Center
Platform: Asztali szoftver
Cél: Egy nagy kijelzős, operátori fókuszú, Windows/macOS compatible desktop alkalmazás ipari karbantartási csapatoknak.

Brief
Építs egy prémium, nagy információsűrűségű asztali alkalmazást, amely egy gyár vagy nagyüzem karbantartási folyamatait kezeli valós időben. Az app fő célja, hogy a műszakvezetők, karbantartók és megbízott mérnökök egyetlen központi felületen lássák a hibajegyeket, gépállapotokat, beavatkozási prioritásokat, készültségi szinteket, alkatrészkészletet, SLA-ket és beavatkozási előzményeket. Az alkalmazásnak erős adatvizualizációt, valós idejű státuszfrissítéseket, szűrhető nézeteket és hatékony billentyűzetes navigációt kell biztosítania.

A rendszer támogassa a többpaneles munkát: bal oldalon legyen élő üzemállapot lista, középen a kiválasztott gép részletei, jobb oldalon pedig teendők, jegyzetek és figyelmeztetések. Legyen beépített shift váltás, task assignment, priority escalation, maintenance timeline, alkatrész-elérhetőség, és hibaok elemzés. A felület legyen ipari, de modern: sötét és világos mód, kiemelt állapotjelzők, erős vizuális hierarchia, minimálisan animált, de nagyon tiszta. A felhasználó azonnal lássa, mit kell tenni, mi blokkol, mi veszélyes, és mi vár jóváhagyásra.

Az app kezeljen több szerepkört: operator, technician, supervisor, inventory manager, admin. Minden szerepkör más főképernyőt és más jogosultságokat kapjon. Legyen részletes audit trail, eseménynapló, alkatrészmozgás, és hibaeseményekhez kapcsolt fotó/dokumentum melléklet. A desktop környezetben fontos az offline-kész működés, a gyors billentyűparancsok, a drag-and-drop prioritásváltás, a táblázatos nézetek és a nagy monitort kihasználó dashboard.

Elvárt feature-ök
Real-time equipment health monitoring.

Multi-pane desktop layout.

Advanced filtering and keyboard shortcuts.

Ticket assignment and escalation.

Inventory and spare parts management.

Maintenance history and audit logs.

Role-based access control.

Attachment handling for photos and documents.

SLA countdowns and overdue alerts.

Chart-heavy analytics dashboard.

Drag-and-drop task prioritization.

Dark/light mode with operator-friendly contrast.

## Kötelező stack-szabályok

STACK: TypeScript + Node.js (Node 24). FONTOS: a fordításnak HIBÁTLANUL le kell mennie, ezért tartsd EGYSZERŰEN és LAZÁN típusozva.
- Backend: Express REST API. src/server.ts KÖTELEZŐ elemei: (1) app.use(express.json()); (2) app.use(express.static('public')); — a frontend kiszolgálásához!, (3) a route-ok bekötése, (4) const PORT = Number(process.env.PORT) || 3000; app.listen(PORT, () => console.log('listening on ' + PORT)). Rétegek: src/routes/*, src/services/*, src/models/* (a típusok legyenek egyszerűek; bőven használj 'any'-t ahol bonyolódna).
- A node:sqlite API-ja (a service-ekben PONTOSAN így): db.prepare('SELECT ...').all(), db.prepare('SELECT ... WHERE id=?').get(id), db.prepare('INSERT INTO x(a,b) VALUES (?,?)').run(a, b) — NINCS db.all()/db.get()/db.run() közvetlenül és NINCS callback! A .run() eredménye: { changes, lastInsertRowid } — a lastInsertRowid bigint is lehet, MINDIG Number(...)-rel konvertáld. A lekérdezések visszatérési értékét castold: db.prepare(...).all() as any[] (vagy as any). Paraméternek SOHA ne adj undefined-ot (használj ?? null-t).
- TÍPUSOK: minden megosztott típust (pl. Note) KIZÁRÓLAG src/models/*-ban definiálj 'export interface'-szel és MINDENHOL onnan importáld — a service/route SOHA ne deklaráljon saját lokális típust.
- EXPORT/IMPORT SZERZŐDÉS: a service-ek NAMED exportokat adnak (export function getX...), a route CSAK named importtal hívja őket ({ getX }) — default export/import a service-rétegben TILOS. A route PONTOSAN a kontextusban kapott export-szignatúrák neveit hívja, sosem talál ki függvénynevet. Minden route-ban importáld a használt típusokat is a models-ből.
- SQLite paraméter: boolean TILOS — konvertáld 0/1-re (pl. value ? 1 : 0); a .run() visszatérése StatementResultingChanges, NE add értékül boolean-nak (használj res.changes > 0-t).
- SQLite-séma: CSAK SQLite-szintaxis! INTERVAL/NOW()/AUTO_INCREMENT TILOS (MySQL-izmusok); dátum-default: DEFAULT (datetime('now','+1 day')); növekvő id: INTEGER PRIMARY KEY AUTOINCREMENT.
- Relatív import mélység: src/services-ből a models = '../models/...', SOHA '../../models/...'.
- LISTA GET-végpont: a szűrő query-param MINDIG OPCIONÁLIS — param nélkül a TELJES listát add vissza (WHERE csak akkor, ha a param ténylegesen megérkezett); 400-at lista-végpont SOHA ne adjon.
- ROUTE-UTAK: a route-fájl belső útjai RELATÍVAK ('/', '/forecasts') — a mount-prefixet ('/api/x') KIZÁRÓLAG a server/barrel app.use adja; a prefixet a route-fájlban megismételni TILOS.
- ADATBÁZIS KÖTELEZŐ: a Node BEÉPÍTETT SQLite modulja — src/db/db.ts PONTOSAN így nyitja: const { DatabaseSync } = require('node:sqlite'); const db = new DatabaseSync(dbPath); — a data/app.db fájlba (a data mappát fs.mkdirSync(..., {recursive:true}) hozza létre). SORREND a db.ts-ben: (1) mappa létrehozás, (2) db megnyitás, (3) db.exec('CREATE TABLE IF NOT EXISTS ...') KÖZVETLENÜL beírt SQL-lel (NE fájlból olvasd a sémát), (4) seed ha üres, (5) a VÉGÉN KÖTELEZŐ: export default db; — más fájl CSAK 'import db from "../db/db"'-vel éri el. MINDEN adatművelet ezen a db-n megy (db.prepare(...).run/get/all). TILOS külső DB-csomag (better-sqlite3, sqlite3 npm) és TILOS JSON-fájl tárolás. Legyen src/db/schema.sql is (dokumentáció).
- FRONTEND: statikus SPA a public/ alatt (index.html + app.js + style.css), az Express express.static-kal szolgálja ki, a fetch hívások relatív '/api/...' útra menjenek.
- Konfig KÖTELEZŐ — package.json: { "type":"commonjs", "scripts": {"build":"tsc","start":"node dist/server.js"}, "dependencies": {"express":"^4.19.2"}, "devDependencies": {"typescript":"^5.5.0","@types/node":"^22.0.0","@types/express":"^4.17.21"} }. tsconfig.json: { "compilerOptions": { "strict": false, "noImplicitAny": false, "skipLibCheck": true, "esModuleInterop": true, "module": "commonjs", "target": "ES2020", "outDir": "dist", "rootDir": "src", "resolveJsonModule": true }, "include": ["src/**/*"] }.
- TESZT: 1 egyszerű teszt a tests/ alatt (plain node assert, ne kelljen jest).
A kód MINDEN importja létező csomagra/fájlra mutasson; ne hivatkozz nem létező modulra.