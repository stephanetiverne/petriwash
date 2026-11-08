
import { useState } from "react";

import {
  Activity,
  CheckCircle2,
  CircleDot,
  Clock,
  History,
  Play,
  RotateCcw,
  WashingMachine,
  Zap,
} from "lucide-react";

import PetriNet, {
  initialMarking,
  fireTransition,
  getEnabledTransitions,
} from "./components/PetriNet";

const initialHistory = [
  {
    id: 0,
    transition: "M0",
    label: "Marquage initial",
    marking: initialMarking,
    time: new Date().toLocaleTimeString(),
  },
];

function getMachineState(marking) {
  const states = {
    P1: "Machine disponible",
    P2: "Linge chargé",
    P3: "Lavage en cours",
    P4: "Rinçage en cours",
    P5: "Essorage en cours",
    P6: "Cycle terminé",
  };

  const activePlace = Object.keys(marking).find(
    (place) => marking[place] > 0
  );

  return states[activePlace] || "État inconnu";
}

export default function App() {
  const [marking, setMarking] = useState(initialMarking);

  const [history, setHistory] = useState(initialHistory);

  const [selectedTransition, setSelectedTransition] =
    useState(null);

  const enabledTransitions =
    getEnabledTransitions(marking);

  const currentState = getMachineState(marking);

  const totalTokens = Object.values(marking).reduce(
    (total, value) => total + value,
    0
  );

  function handleFire(transition) {
    const nextMarking = fireTransition(
      marking,
      transition
    );

    if (nextMarking === marking) {
      return;
    }

    setMarking(nextMarking);

    setSelectedTransition(transition.id);

    setHistory((previousHistory) => [
      ...previousHistory,
      {
        id: previousHistory.length,
        transition: transition.id,
        label: transition.label,
        marking: nextMarking,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  }

  function handleReset() {
    setMarking(initialMarking);

    setSelectedTransition(null);

    setHistory([
      {
        id: 0,
        transition: "M0",
        label: "Marquage initial",
        marking: initialMarking,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <WashingMachine size={25} />
          </div>

          <div>
            <h1>PetriWash</h1>
            <p>Simulation de Réseau de Petri</p>
          </div>
        </div>

        <div className="header-status">
          <span className="status-dot" />
          Simulation active
        </div>
      </header>

      <main className="dashboard">
        <section className="welcome">
          <div>
            <span className="eyebrow">
              PROJET RDP · INFORMATIQUE
            </span>

            <h2>
              Gestion intelligente
              <br />
              <span>de machine à laver</span>
            </h2>

            <p>
              Visualisez et simulez le fonctionnement
              d'une machine à laver grâce aux Réseaux
              de Petri.
            </p>
          </div>

          <div className="welcome-icon">
            <WashingMachine size={90} strokeWidth={1.2} />
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon green">
              <Activity size={20} />
            </div>

            <div>
              <span>État actuel</span>
              <strong>{currentState}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <Zap size={20} />
            </div>

            <div>
              <span>Transitions activables</span>
              <strong>
                {enabledTransitions.length}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <CircleDot size={20} />
            </div>

            <div>
              <span>Nombre de jetons</span>
              <strong>{totalTokens}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              <History size={20} />
            </div>

            <div>
              <span>Franchissements</span>
              <strong>{history.length - 1}</strong>
            </div>
          </div>
        </section>

        <section className="panel network-panel">
          <div className="panel-header">
            <div>
              <h3>Réseau de Petri</h3>
              <p>
                Cliquez sur une transition activable
                pour la franchir.
              </p>
            </div>

            <div className="marking-badge">
              M{history.length - 1}
            </div>
          </div>

          <PetriNet
            marking={marking}
            onFire={handleFire}
            selectedTransition={selectedTransition}
          />
        </section>

        <section className="panel simulation-panel">
          <div className="panel-header">
            <div>
              <h3>Simulation du cycle</h3>
              <p>
                Sélectionnez une transition pour faire
                évoluer le système.
              </p>
            </div>

            <button
              className="reset-button"
              onClick={handleReset}
            >
              <RotateCcw size={16} />
              Réinitialiser
            </button>
          </div>

          <div className="transition-grid">
            {[
              {
                id: "T1",
                label: "Charger le linge",
              },
              {
                id: "T2",
                label: "Démarrer le lavage",
              },
              {
                id: "T3",
                label: "Terminer le lavage",
              },
              {
                id: "T4",
                label: "Terminer le rinçage",
              },
              {
                id: "T5",
                label: "Terminer l'essorage",
              },
              {
                id: "T6",
                label: "Décharger le linge",
              },
            ].map((transition) => {
              const enabled =
                enabledTransitions.some(
                  (item) => item.id === transition.id
                );

              const active =
                selectedTransition === transition.id;

              return (
                <button
                  key={transition.id}
                  className={`transition-card ${
                    enabled ? "enabled" : "disabled"
                  } ${active ? "selected" : ""}`}
                  disabled={!enabled}
                  onClick={() => {
                    const fullTransition =
                      enabledTransitions.find(
                        (item) =>
                          item.id === transition.id
                      );

                    if (fullTransition) {
                      handleFire(fullTransition);
                    }
                  }}
                >
                  <div className="transition-card-top">
                    <span className="transition-number">
                      {transition.id}
                    </span>

                    {enabled ? (
                      <CheckCircle2
                        size={18}
                        className="enabled-icon"
                      />
                    ) : (
                      <CircleDot
                        size={18}
                        className="disabled-icon"
                      />
                    )}
                  </div>

                  <strong>{transition.label}</strong>

                  <span className="transition-status">
                    {enabled
                      ? "Activable"
                      : "Non activable"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel history-panel">
          <div className="panel-header">
            <div>
              <h3>Historique des franchissements</h3>
              <p>
                Suivi de l'évolution du marquage.
              </p>
            </div>

            <Clock size={20} className="history-icon" />
          </div>

          <div className="history-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Étape</th>
                  <th>Transition</th>
                  <th>Action</th>
                  <th>Marquage</th>
                  <th>Heure</th>
                </tr>
              </thead>

              <tbody>
                {[...history]
                  .reverse()
                  .map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="step-number">
                          {item.id}
                        </span>
                      </td>

                      <td>
                        <span className="table-transition">
                          {item.transition}
                        </span>
                      </td>

                      <td>{item.label}</td>

                      <td>
                        <code>
                          (
                          {Object.values(item.marking).join(
                            ", "
                          )}
                          )
                        </code>
                      </td>

                      <td>{item.time}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="footer">
          <span>
            PetriWash · Projet académique
          </span>

          <span>
            Réseaux de Petri · React + Vite
          </span>
        </footer>
      </main>
    </div>
  );
}
