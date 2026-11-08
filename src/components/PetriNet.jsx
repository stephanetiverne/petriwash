
import { useMemo } from "react";

const places = [
  { id: "P1", label: "Machine disponible" },
  { id: "P2", label: "Linge chargé" },
  { id: "P3", label: "Lavage en cours" },
  { id: "P4", label: "Rinçage en cours" },
  { id: "P5", label: "Essorage en cours" },
  { id: "P6", label: "Cycle terminé" },
];

const transitions = [
  {
    id: "T1",
    label: "Charger le linge",
    from: "P1",
    to: "P2",
  },
  {
    id: "T2",
    label: "Démarrer le lavage",
    from: "P2",
    to: "P3",
  },
  {
    id: "T3",
    label: "Terminer le lavage",
    from: "P3",
    to: "P4",
  },
  {
    id: "T4",
    label: "Terminer le rinçage",
    from: "P4",
    to: "P5",
  },
  {
    id: "T5",
    label: "Terminer l'essorage",
    from: "P5",
    to: "P6",
  },
  {
    id: "T6",
    label: "Décharger le linge",
    from: "P6",
    to: "P1",
  },
];

export const initialMarking = {
  P1: 1,
  P2: 0,
  P3: 0,
  P4: 0,
  P5: 0,
  P6: 0,
};

// Vérifie si une transition est franchissable.
export function isEnabled(marking, transition) {
  return marking[transition.from] >= 1;
}

// Franchit une transition et retourne un nouveau marquage.
export function fireTransition(marking, transition) {
  if (!isEnabled(marking, transition)) {
    return marking;
  }

  const nextMarking = { ...marking };

  // Retirer le jeton de la place d'entrée.
  nextMarking[transition.from] -= 1;

  // Ajouter le jeton dans la place de sortie.
  nextMarking[transition.to] += 1;

  return nextMarking;
}

export function getEnabledTransitions(marking) {
  return transitions.filter((transition) =>
    isEnabled(marking, transition)
  );
}

export default function PetriNet({
  marking,
  onFire,
  selectedTransition,
}) {
  const enabledTransitions = useMemo(
    () => getEnabledTransitions(marking),
    [marking]
  );

  const placePositions = [
    { x: 90, y: 110 },
    { x: 250, y: 110 },
    { x: 410, y: 110 },
    { x: 570, y: 110 },
    { x: 730, y: 110 },
    { x: 890, y: 110 },
  ];

  const transitionPositions = [
    { x: 170, y: 110 },
    { x: 330, y: 110 },
    { x: 490, y: 110 },
    { x: 650, y: 110 },
    { x: 810, y: 110 },
    { x: 970, y: 110 },
  ];

  const placeMap = Object.fromEntries(
    places.map((place, index) => [
      place.id,
      placePositions[index],
    ])
  );

  const transitionMap = Object.fromEntries(
    transitions.map((transition, index) => [
      transition.id,
      transitionPositions[index],
    ])
  );

  return (
    <div className="network-container">
      <svg
        viewBox="0 0 1060 240"
        className="petri-svg"
        role="img"
        aria-label="Réseau de Petri de la machine à laver"
      >
        <defs>
          <marker
            id="arrow"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path
              d="M0,0 L8,4 L0,8 Z"
              fill="currentColor"
            />
          </marker>
        </defs>

     
{/* Arcs entre les places et les transitions */}
{transitions.map((transition) => {
  const from = placeMap[transition.from];
  const to = placeMap[transition.to];
  const position = transitionMap[transition.id];

  const isLastTransition = transition.id === "T6";

  return (
    <g key={transition.id}>
      {/* Arc entrant dans la transition */}
      <line
        x1={from.x + 36}
        y1={from.y}
        x2={position.x - 7}
        y2={position.y}
        className="petri-arc"
        markerEnd="url(#arrow)"
      />

      {/* Arc sortant de la transition */}
      {isLastTransition ? (
        <path
          d={`M ${position.x + 7} ${position.y}
              C 1030 20, 120 20, 90 74`}
          className="petri-arc"
          markerEnd="url(#arrow)"
        />
      ) : (
        <line
          x1={position.x + 7}
          y1={position.y}
          x2={to.x - 36}
          y2={to.y}
          className="petri-arc"
          markerEnd="url(#arrow)"
        />
      )}
    </g>
  );
})}


        {/* Places */}
        {places.map((place, index) => {
          const position = placePositions[index];

          return (
            <g key={place.id}>
              <circle
                cx={position.x}
                cy={position.y}
                r="36"
                className={`petri-place ${
                  marking[place.id] > 0
                    ? "place-marked"
                    : ""
                }`}
              />

              {marking[place.id] > 0 && (
                <circle
                  cx={position.x}
                  cy={position.y}
                  r="7"
                  className="petri-token"
                />
              )}

              <text
                x={position.x}
                y={position.y - 48}
                className="place-id"
                textAnchor="middle"
              >
                {place.id}
              </text>

              <text
                x={position.x}
                y={position.y + 57}
                className="place-label"
                textAnchor="middle"
              >
                {place.label}
              </text>

              <text
                x={position.x}
                y={position.y + 77}
                className="token-count"
                textAnchor="middle"
              >
                Jetons : {marking[place.id]}
              </text>
            </g>
          );
        })}

        {/* Transitions */}
        {transitions.map((transition) => {
          const position = transitionMap[transition.id];

          const enabled = isEnabled(marking, transition);

          const selected =
            selectedTransition === transition.id;

          return (
            <g
              key={transition.id}
              className={`petri-transition ${
                enabled ? "transition-enabled" : ""
              } ${selected ? "transition-selected" : ""}`}
              onClick={() => {
                if (enabled) {
                  onFire(transition);
                }
              }}
              role="button"
              tabIndex={enabled ? 0 : -1}
              aria-label={transition.label}
              onKeyDown={(event) => {
                if (
                  enabled &&
                  (event.key === "Enter" ||
                    event.key === " ")
                ) {
                  event.preventDefault();
                  onFire(transition);
                }
              }}
            >
              <rect
                x={position.x - 7}
                y={position.y - 25}
                width="14"
                height="50"
                rx="3"
              />

              <text
                x={position.x}
                y={position.y - 34}
                textAnchor="middle"
                className="transition-id"
              >
                {transition.id}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="network-legend">
        <span>
          <span className="legend-circle" />
          Place
        </span>

        <span>
          <span className="legend-bar" />
          Transition
        </span>

        <span>
          <span className="legend-token" />
          Jeton
        </span>
      </div>
    </div>
  );
}
