# The Perceptron: The First Learning Machine (1958)

## 1. Historical context
The perceptron was introduced by Frank Rosenblatt in 1958 as a model of a learning machine that updates internal weights from data. It followed the theoretical neuron of McCulloch and Pitts (1943) and was implemented in hardware as the Mark I Perceptron. A rigorous critique by Minsky and Papert (1969) showed formal limitations—most notably, the inability to solve linearly inseparable problems such as XOR—which reshaped expectations and research directions.

**Why it matters:** It is the first widely recognized algorithm that learns a classifier from labeled data via an explicit update rule. It seeded the lineage leading to multilayer perceptrons and modern deep networks.

## 2. Problem setup
Binary classification with labels \(y_i \in \{-1, +1\}\) and inputs \(x_i \in \mathbb{R}^d\).
A perceptron uses a linear decision function
\[
\hat{y} = \operatorname{sign}(w^\top x + b),
\]
with weights \(w \in \mathbb{R}^d\) and bias \(b \in \mathbb{R}\). The decision boundary is the hyperplane \(\{x : w^\top x + b = 0\}\).

## 3. Learning rule (Perceptron Learning Algorithm)
Initialize \(w = 0, b = 0\). Iterate over the training samples:
1. Compute \(\hat{y}_i = \operatorname{sign}(w^\top x_i + b)\).
2. If \(\hat{y}_i \neq y_i\), update
\[
w \leftarrow w + \eta\, y_i x_i,\quad
b \leftarrow b + \eta\, y_i,
\]
with learning rate \(\eta > 0\).

**Intuition:** On a mistake, move the separating hyperplane toward correctly classifying the misclassified point by nudging \(w\) in the direction of \(y_i x_i\).

## 4. Convergence (when it works)
If the data are **linearly separable**, the perceptron converges in a finite number of updates (Perceptron Convergence Theorem). A margin assumption—there exist \((w^\*, b^\*)\) such that \(y_i (w^{*\top} x_i + b^\*) \ge \gamma > 0\) for all \(i\)—implies a bound on the number of mistakes as a function of the margin and the data radius.

## 5. Limitations (when it fails)
- **Linearly inseparable data:** Cannot represent non-linear separations (e.g., XOR). Without separability it will not converge and may cycle.
- **No probabilistic outputs:** Produces hard labels, not calibrated probabilities.
- **Scaling sensitivity:** Feature scaling affects update geometry and learning speed.

These limitations motivated non-linear representations (hidden layers, kernels) and probabilistic models.

## 6. Legacy and influence
- Replacing the hard threshold with differentiable activations (sigmoid, tanh, ReLU) enables gradient-based training of **multilayer perceptrons** via backpropagation.
- **Support Vector Machines** address robustness by maximizing margin among linear classifiers.
- Modern deep learning stacks many perceptron-like units with non-linearities to form expressive function approximators.

## 7. What to examine in experiments (to be shown interactively)
- **Separable vs. inseparable regimes:** demonstrate convergence and failure.
- **Learning rate and data order:** show their effect on update dynamics.
- **Geometric view:** visualize movement of the decision boundary after mistakes.
- **Feature scaling:** compare convergence speed with and without normalization.

## 8. References
1. Rosenblatt, F. (1958). *The Perceptron: A Probabilistic Model for Information Storage and Organization in the Brain*. Psychological Review, 65(6), 386–408.  
2. Minsky, M., & Papert, S. (1969). *Perceptrons*. MIT Press.  
3. Novikoff, A. B. J. (1962). *On Convergence Proofs for Perceptrons*. Proceedings of the Symposium on the Mathematical Theory of Automata.  
4. McCulloch, W. S., & Pitts, W. (1943). *A Logical Calculus of the Ideas Immanent in Nervous Activity*. Bulletin of Mathematical Biophysics, 5, 115–133.  
5. Goodfellow, I., Bengio, Y., & Courville, A. (2016). *Deep Learning*. MIT Press.

---

*Interactive demo link will be added here once the client-side page is created.*
